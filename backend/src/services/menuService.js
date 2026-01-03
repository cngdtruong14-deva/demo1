const Category = require('../models/Category');
const Product = require('../models/Product');
const Branch = require('../models/Branch');
const { NotFoundError } = require('../utils/errors');

class MenuService {
  /**
   * Get menu by branch ID
   * Returns nested structure: { categories: [{ ...products }] }
   */
  static async getMenuByBranch(branchId, filters = {}) {
    // Verify branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new NotFoundError('Branch', branchId);
    }

    // Get categories with product count
    const categories = await Category.findByBranch(branchId);

    // Get all products for this branch
    const products = await Product.findByBranch(branchId, {
      status: filters.status || 'available',
      search: filters.search
    });

    // Group products by category
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        display_order: cat.display_order,
        status: cat.status,
        product_count: parseInt(cat.product_count) || 0,
        products: []
      });
    });

    // Assign products to categories
    products.forEach(product => {
      const category = categoryMap.get(product.category_id);
      if (category) {
        // Parse tags JSON if exists
        let tags = [];
        if (product.tags) {
          try {
            tags = typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags;
          } catch (e) {
            tags = [];
          }
        }

        category.products.push({
          id: product.id,
          category_id: product.category_id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          cost_price: product.cost_price ? parseFloat(product.cost_price) : null,
          image_url: product.image_url,
          preparation_time: product.preparation_time,
          calories: product.calories,
          is_spicy: Boolean(product.is_spicy),
          is_vegetarian: Boolean(product.is_vegetarian),
          tags: tags,
          status: product.status,
          sold_count: product.sold_count,
          rating: parseFloat(product.rating) || 0.00
        });
      }
    });

    // Convert map to array and filter out empty categories if needed
    const categoriesArray = Array.from(categoryMap.values())
      .filter(cat => !filters.hideEmpty || cat.products.length > 0)
      .sort((a, b) => a.display_order - b.display_order);

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        address: branch.address,
        phone: branch.phone
      },
      categories: categoriesArray,
      metadata: {
        total_categories: categoriesArray.length,
        total_products: products.length,
        generated_at: new Date().toISOString()
      }
    };
  }

  /**
   * Get menu summary (categories only)
   */
  static async getMenuSummary(branchId) {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      throw new NotFoundError('Branch', branchId);
    }

    const categories = await Category.findByBranch(branchId);
    
    return {
      branch: {
        id: branch.id,
        name: branch.name
      },
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        display_order: cat.display_order,
        product_count: parseInt(cat.product_count) || 0
      }))
    };
  }
}

module.exports = MenuService;

