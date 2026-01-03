const db = require('../config/database');

class Customer {
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, s.name as segment_name, s.color as segment_color,
              s.discount_percentage as segment_discount
       FROM customers c
       LEFT JOIN segments s ON c.segment_id = s.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByPhone(phone) {
    const [rows] = await db.execute(
      'SELECT * FROM customers WHERE phone = ?',
      [phone]
    );
    return rows[0] || null;
  }

  static async create(customerData) {
    const { phone, name, email, gender, dateOfBirth } = customerData;
    const id = require('uuid').v4();
    
    await db.execute(
      `INSERT INTO customers (id, phone, name, email, gender, date_of_birth) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, phone, name || null, email || null, gender || null, dateOfBirth || null]
    );
    
    return this.findById(id);
  }

  static async update(id, customerData) {
    const { name, email, gender, dateOfBirth } = customerData;
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (dateOfBirth !== undefined) {
      updates.push('date_of_birth = ?');
      params.push(dateOfBirth);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);
      await db.execute(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    return this.findById(id);
  }

  static async updateStats(customerId, orderTotal) {
    await db.execute(
      `UPDATE customers SET
        total_orders = total_orders + 1,
        total_spent = total_spent + ?,
        last_order_date = CURRENT_TIMESTAMP,
        avg_order_value = (total_spent + ?) / (total_orders + 1),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [orderTotal, orderTotal, customerId]
    );
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT c.*, s.name as segment_name, s.color as segment_color
      FROM customers c
      LEFT JOIN segments s ON c.segment_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.segmentId) {
      query += ' AND c.segment_id = ?';
      params.push(filters.segmentId);
    }

    if (filters.search) {
      query += ' AND (c.phone LIKE ? OR c.name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters.status) {
      query += ' AND c.status = ?';
      params.push(filters.status);
    }

    // Sorting
    const sortBy = filters.sortBy || 'total_spent';
    const sortOrder = filters.sortOrder || 'DESC';
    query += ` ORDER BY c.${sortBy} ${sortOrder}`;

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

  static async getStats(customerId) {
    const [rows] = await db.execute(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_spent,
        COALESCE(AVG(total), 0) as avg_order_value,
        MAX(created_at) as last_order_date
       FROM orders
       WHERE customer_id = ? AND order_status = 'completed'`,
      [customerId]
    );
    return rows[0] || {};
  }
}

module.exports = Customer;

