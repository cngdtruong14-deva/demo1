/**
 * Product Model
 * Product/Menu item data operations
 */

const BaseModel = require('./base.model');

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  /**
   * Find products by branch
   */
  async findByBranch(branchId, options = {}) {
    return await this.findAll({ branch_id: branchId, status: 'available' }, options);
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId, options = {}) {
    return await this.findAll({ category_id: categoryId, status: 'available' }, options);
  }

  /**
   * Search products
   */
  async search(searchTerm, branchId = null) {
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];
    let branchCondition = '';

    if (branchId) {
      branchCondition = 'AND branch_id = ?';
      params.push(branchId);
    }

    const sql = `
      SELECT * FROM products
      WHERE (name LIKE ? OR description LIKE ?)
        AND status = 'available'
        ${branchCondition}
      ORDER BY sold_count DESC
      LIMIT 20
    `;

    return await query(sql, params);
  }

  /**
   * Get bestsellers
   */
  async getBestsellers(branchId, limit = 10) {
    const params = [branchId, limit];
    const sql = `
      SELECT * FROM products
      WHERE branch_id = ? AND status = 'available'
      ORDER BY sold_count DESC
      LIMIT ?
    `;

    return await query(sql, params);
  }
}

module.exports = new ProductModel();

