/**
 * Product Controller
 * CRUD operations for products/menu items
 */

const { query } = require('../config/database');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseFormatter');
const { getCache, setCache, deleteCache } = require('../config/redis');
const { CACHE_KEYS, CACHE_TTL } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filters
 * @access  Public
 */
async function getAllProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      branch_id,
      category_id,
      status = 'available',
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (branch_id) {
      whereConditions.push('p.branch_id = ?');
      params.push(branch_id);
    }

    if (category_id) {
      whereConditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (status) {
      whereConditions.push('p.status = ?');
      params.push(status);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products p 
      ${whereClause}
    `;
    const [countResult] = await query(countQuery, params);
    const total = countResult.total;

    // Get products
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.display_order ASC, p.sold_count DESC
      LIMIT ? OFFSET ?
    `;

    const products = await query(productsQuery, [...params, parseInt(limit), offset]);

    return sendPaginated(res, products, page, limit, total, 'Products retrieved successfully');
  } catch (error) {
    logger.error('Get all products error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = CACHE_KEYS.PRODUCT(id);
    const cachedProduct = await getCache(cacheKey);

    if (cachedProduct) {
      return sendSuccess(res, cachedProduct, 'Product retrieved from cache');
    }

    // Query database
    const products = await query(
      `SELECT 
        p.*,
        c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return sendError(res, 'Product not found', null, 404);
    }

    // Cache the result
    await setCache(cacheKey, products[0], CACHE_TTL.MEDIUM);

    return sendSuccess(res, products[0], 'Product retrieved successfully');
  } catch (error) {
    logger.error('Get product by ID error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/products
 * @desc    Create new product
 * @access  Private (Admin/Manager)
 */
async function createProduct(req, res, next) {
  try {
    const {
      branch_id,
      category_id,
      name,
      description,
      price,
      cost_price,
      image_url,
      preparation_time,
      calories,
      is_spicy,
      is_vegetarian,
      tags,
    } = req.body;

    const result = await query(
      `INSERT INTO products 
       (branch_id, category_id, name, description, price, cost_price, image_url, 
        preparation_time, calories, is_spicy, is_vegetarian, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [
        branch_id,
        category_id,
        name,
        description,
        price,
        cost_price,
        image_url,
        preparation_time,
        calories,
        is_spicy || false,
        is_vegetarian || false,
        tags ? JSON.stringify(tags) : null,
      ]
    );

    const productId = result.insertId;

    // Get full product data with category info
    const [newProduct] = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [productId]
    );

    logger.info(`Product created: ${name} (ID: ${productId})`);

    // Invalidate menu cache
    await deleteCache(CACHE_KEYS.MENU(branch_id));

    // 🔥 Real-time: Broadcast menu update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to all clients
      io.emit('menu_updated', {
        action: 'create',
        product: newProduct,
        branchId: branch_id,
        timestamp: new Date().toISOString(),
      });

      // Also emit to branch-specific room
      io.to(`branch:${branch_id}`).emit('menu_updated', {
        action: 'create',
        product: newProduct,
        branchId: branch_id,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Socket event emitted: menu_updated (create) for product ${productId}`);
    }

    return sendSuccess(
      res,
      { id: productId, name, product: newProduct },
      'Product created successfully',
      201
    );
  } catch (error) {
    logger.error('Create product error:', error);
    next(error);
  }
}

/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product
 * @access  Private (Admin/Manager)
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Build dynamic update query
    const fields = Object.keys(updateData)
      .filter(key => key !== 'id') // Don't update ID
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.keys(updateData)
      .filter(key => key !== 'id')
      .map(key => updateData[key]);

    if (fields.length === 0) {
      return sendError(res, 'No update data provided', null, 400);
    }

    await query(
      `UPDATE products SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );

    // Get updated product with category info
    const [updatedProduct] = await query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );

    if (!updatedProduct) {
      return sendError(res, 'Product not found', null, 404);
    }

    // Invalidate caches
    await deleteCache(CACHE_KEYS.PRODUCT(id));
    await deleteCache(CACHE_KEYS.MENU(updatedProduct.branch_id));

    logger.info(`Product updated: ID ${id}`);

    // 🔥 Real-time: Broadcast menu update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to all clients
      io.emit('menu_updated', {
        action: 'update',
        product: updatedProduct,
        branchId: updatedProduct.branch_id,
        timestamp: new Date().toISOString(),
      });

      // Also emit to branch-specific room
      io.to(`branch:${updatedProduct.branch_id}`).emit('menu_updated', {
        action: 'update',
        product: updatedProduct,
        branchId: updatedProduct.branch_id,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Socket event emitted: menu_updated (update) for product ${id}`);
    }

    return sendSuccess(res, { id, product: updatedProduct }, 'Product updated successfully');
  } catch (error) {
    logger.error('Update product error:', error);
    next(error);
  }
}

/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    // Get product info before deleting (for socket event)
    const [product] = await query('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return sendError(res, 'Product not found', null, 404);
    }

    await query('DELETE FROM products WHERE id = ?', [id]);

    // Invalidate cache
    await deleteCache(CACHE_KEYS.PRODUCT(id));
    await deleteCache(CACHE_KEYS.MENU(product.branch_id));

    logger.info(`Product deleted: ID ${id}`);

    // 🔥 Real-time: Broadcast menu update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to all clients
      io.emit('menu_updated', {
        action: 'delete',
        productId: id,
        product: product,
        branchId: product.branch_id,
        timestamp: new Date().toISOString(),
      });

      // Also emit to branch-specific room
      io.to(`branch:${product.branch_id}`).emit('menu_updated', {
        action: 'delete',
        productId: id,
        product: product,
        branchId: product.branch_id,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Socket event emitted: menu_updated (delete) for product ${id}`);
    }

    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    logger.error('Delete product error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/menu/:branchId
 * @desc    Get complete menu for a branch (grouped by categories)
 * @access  Public
 */
async function getMenu(req, res, next) {
  try {
    const { branchId } = req.params;

    // Check cache
    const cacheKey = CACHE_KEYS.MENU(branchId);
    const cachedMenu = await getCache(cacheKey);

    if (cachedMenu) {
      return sendSuccess(res, cachedMenu, 'Menu retrieved from cache');
    }

    // Get categories
    const categories = await query(
      `SELECT * FROM categories WHERE status = 'active' ORDER BY display_order ASC`
    );

    // Get products for this branch
    const products = await query(
      `SELECT * FROM products 
       WHERE branch_id = ? AND status = 'available' 
       ORDER BY category_id, sold_count DESC`,
      [branchId]
    );

    // Group products by category
    const menu = categories.map((category) => ({
      ...category,
      products: products.filter((p) => p.category_id === category.id),
    }));

    // Cache the menu
    await setCache(cacheKey, menu, CACHE_TTL.MEDIUM);

    return sendSuccess(res, menu, 'Menu retrieved successfully');
  } catch (error) {
    logger.error('Get menu error:', error);
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMenu,
};

