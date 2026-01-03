/**
 * Order Model
 * Order data operations
 */

const BaseModel = require('./base.model');

class OrderModel extends BaseModel {
  constructor() {
    super('orders');
  }

  /**
   * Find orders by branch
   */
  async findByBranch(branchId, options = {}) {
    return await this.findAll({ branch_id: branchId }, options);
  }

  /**
   * Find orders by table
   */
  async findByTable(tableId) {
    return await this.findAll({ table_id: tableId });
  }

  /**
   * Find active orders
   */
  async findActive(branchId) {
    const { query } = require('../config/database');
    const sql = `
      SELECT * FROM orders
      WHERE branch_id = ?
        AND order_status IN ('pending', 'confirmed', 'preparing', 'ready')
      ORDER BY created_at ASC
    `;
    return await query(sql, [branchId]);
  }

  /**
   * Find orders by customer
   */
  async findByCustomer(customerId, options = {}) {
    return await this.findAll({ customer_id: customerId }, options);
  }
}

module.exports = new OrderModel();

