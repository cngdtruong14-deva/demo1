const db = require('../config/database');

class OrderItem {
  static async findByOrderId(orderId) {
    const [rows] = await db.execute(
      `SELECT oi.*, p.name as product_name, p.image_url as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?
       ORDER BY oi.created_at ASC`,
      [orderId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM order_items WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(itemData) {
    const {
      orderId,
      productId,
      productName,
      quantity,
      unitPrice,
      subtotal,
      notes
    } = itemData;

    const id = require('uuid').v4();

    await db.execute(
      `INSERT INTO order_items (
        id, order_id, product_id, product_name, quantity, unit_price, subtotal, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orderId, productId, productName, quantity, unitPrice, subtotal, notes || null]
    );

    return this.findById(id);
  }

  static async createBatch(items) {
    if (!items || items.length === 0) return [];

    const values = [];
    const placeholders = [];
    const params = [];

    items.forEach((item) => {
      const id = require('uuid').v4();
      placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?)');
      params.push(
        id,
        item.orderId,
        item.productId,
        item.productName,
        item.quantity,
        item.unitPrice,
        item.subtotal,
        item.notes || null
      );
    });

    await db.execute(
      `INSERT INTO order_items (
        id, order_id, product_id, product_name, quantity, unit_price, subtotal, notes
      ) VALUES ${placeholders.join(', ')}`,
      params
    );

    // Return created items
    const orderId = items[0].orderId;
    return this.findByOrderId(orderId);
  }

  static async updateStatus(id, status) {
    await db.execute(
      'UPDATE order_items SET status = ? WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  }

  static async calculateOrderTotal(orderId) {
    const [rows] = await db.execute(
      'SELECT SUM(subtotal) as total FROM order_items WHERE order_id = ?',
      [orderId]
    );
    return rows[0].total || 0;
  }
}

module.exports = OrderItem;

