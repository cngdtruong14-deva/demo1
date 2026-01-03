const db = require('../config/database');

class Order {
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT o.*, 
              t.table_number, t.capacity,
              b.name as branch_name, b.address as branch_address,
              c.name as customer_name, c.phone as customer_phone
       FROM orders o
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN branches b ON o.branch_id = b.id
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByOrderNumber(orderNumber) {
    const [rows] = await db.execute('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    return rows[0] || null;
  }

  static async findByTable(tableId, filters = {}) {
    let query = `
      SELECT o.* FROM orders o
      WHERE o.table_id = ?
    `;
    const params = [tableId];

    if (filters.status) {
      query += ' AND o.order_status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY o.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async create(orderData) {
    const { tableId, branchId, customerId, subtotal, discount, tax, total, paymentMethod, notes } = orderData;

    const id = require('uuid').v4();
    const orderNumber = this.generateOrderNumber();

    await db.execute(
      `INSERT INTO orders (
        id, order_number, table_id, branch_id, customer_id,
        subtotal, discount, tax, total, payment_method, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        orderNumber,
        tableId,
        branchId,
        customerId || null,
        subtotal,
        discount || 0,
        tax || 0,
        total,
        paymentMethod || 'cash',
        notes || null
      ]
    );

    return this.findById(id);
  }

  static async updateStatus(id, status, notes = null) {
    const updates = ['order_status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const params = [status, id];

    if (status === 'completed') {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    } else if (status === 'cancelled') {
      updates.push('cancelled_at = CURRENT_TIMESTAMP');
      if (notes) {
        updates.push('notes = CONCAT(COALESCE(notes, ""), ?)');
        params.splice(1, 0, `\nCancelled: ${notes}`);
      }
    }

    await db.execute(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  static async updatePaymentStatus(id, paymentStatus) {
    await db.execute('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      paymentStatus,
      id
    ]);
    return this.findById(id);
  }

  static generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  }

  static async getTimeline(orderId) {
    // This would typically come from an order_status_history table
    // For now, return basic timeline from order status
    const order = await this.findById(orderId);
    if (!order) return [];

    return [
      {
        status: order.order_status,
        timestamp: order.created_at
      }
    ];
  }
}

module.exports = Order;
