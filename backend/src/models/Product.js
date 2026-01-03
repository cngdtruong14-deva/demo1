const db = require('../config/database');

class Product {
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByBranch(branchId, filters = {}) {
    let query = `
      SELECT p.*, c.name as category_name, c.icon as category_icon
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.branch_id = ?
    `;
    const params = [branchId];

    if (filters.categoryId) {
      query += ' AND p.category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sorting
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'ASC';
    const allowedSorts = ['name', 'price', 'sold_count', 'rating', 'created_at'];
    if (allowedSorts.includes(sortBy)) {
      query += ` ORDER BY p.${sortBy} ${sortOrder}`;
    } else {
      query += ' ORDER BY p.name ASC';
    }

    // Pagination
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async countByBranch(branchId, filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM products WHERE branch_id = ?';
    const params = [branchId];

    if (filters.categoryId) {
      query += ' AND category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].total;
  }

  static async create(productData) {
    const {
      branchId,
      categoryId,
      name,
      description,
      price,
      costPrice,
      imageUrl,
      preparationTime,
      calories,
      isSpicy,
      isVegetarian,
      tags
    } = productData;

    const id = require('uuid').v4();
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;

    await db.execute(
      `INSERT INTO products (
        id, branch_id, category_id, name, description, price, cost_price,
        image_url, preparation_time, calories, is_spicy, is_vegetarian, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        branchId,
        categoryId,
        name,
        description || null,
        price,
        costPrice || null,
        imageUrl || null,
        preparationTime || 15,
        calories || null,
        isSpicy || false,
        isVegetarian || false,
        tagsJson
      ]
    );

    return this.findById(id);
  }
}

module.exports = Product;

