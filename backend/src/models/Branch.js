const db = require('../config/database');

class Branch {
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM branches WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findAll() {
    const [rows] = await db.execute(
      'SELECT * FROM branches WHERE status = ? ORDER BY created_at DESC',
      ['active']
    );
    return rows;
  }

  static async create(branchData) {
    const { name, address, phone, email, openingTime, closingTime } = branchData;
    const id = require('uuid').v4();
    
    await db.execute(
      `INSERT INTO branches (id, name, address, phone, email, opening_time, closing_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, address, phone, email || null, openingTime || '08:00:00', closingTime || '22:00:00']
    );
    
    return this.findById(id);
  }
}

module.exports = Branch;

