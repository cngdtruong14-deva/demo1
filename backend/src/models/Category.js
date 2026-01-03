const db = require('../config/database');

class Category {
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM categories WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY display_order ASC, name ASC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findByBranch(branchId) {
    // Categories are shared across branches, but we can filter products by branch
    const [rows] = await db.execute(
      `SELECT DISTINCT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.branch_id = ?
       WHERE c.status = 'active'
       GROUP BY c.id
       ORDER BY c.display_order ASC, c.name ASC`,
      [branchId]
    );
    return rows;
  }

  static async create(categoryData) {
    const { name, description, icon, displayOrder } = categoryData;
    const id = require('uuid').v4();
    
    await db.execute(
      `INSERT INTO categories (id, name, description, icon, display_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, name, description || null, icon || null, displayOrder || 0]
    );
    
    return this.findById(id);
  }
}

module.exports = Category;

