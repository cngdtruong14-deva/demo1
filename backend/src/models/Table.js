const db = require('../config/database');

class Table {
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tables WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByBranch(branchId, filters = {}) {
    let query = 'SELECT * FROM tables WHERE branch_id = ?';
    const params = [branchId];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.floor) {
      query += ' AND floor_number = ?';
      params.push(filters.floor);
    }

    query += ' ORDER BY table_number ASC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findByQrCode(qrCode) {
    const [rows] = await db.execute('SELECT * FROM tables WHERE qr_code = ?', [qrCode]);
    return rows[0] || null;
  }

  static async create(tableData) {
    const { branchId, tableNumber, capacity, qrCode, floorNumber, zone } = tableData;
    const id = require('uuid').v4();

    await db.execute(
      `INSERT INTO tables (id, branch_id, table_number, capacity, qr_code, floor_number, zone) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, branchId, tableNumber, capacity || 4, qrCode, floorNumber || 1, zone || null]
    );

    return this.findById(id);
  }

  static async updateStatus(id, status) {
    await db.execute('UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    return this.findById(id);
  }

  static async getCurrentOrder(tableId) {
    const [rows] = await db.execute(
      `SELECT o.* FROM orders o
       WHERE o.table_id = ? 
       AND o.order_status IN ('pending', 'confirmed', 'preparing', 'ready')
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [tableId]
    );
    return rows[0] || null;
  }
}

module.exports = Table;
