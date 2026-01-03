/**
 * Customer Model
 * Customer data operations
 */

const BaseModel = require('./base.model');

class CustomerModel extends BaseModel {
  constructor() {
    super('customers');
  }

  /**
   * Find customer by phone
   */
  async findByPhone(phone) {
    return await this.findOne({ phone });
  }

  /**
   * Find customer by email
   */
  async findByEmail(email) {
    return await this.findOne({ email });
  }

  /**
   * Update customer segment
   */
  async updateSegment(customerId, segmentId) {
    return await this.update(customerId, { segment_id: segmentId });
  }

  /**
   * Get top customers by spending
   */
  async getTopCustomers(limit = 10) {
    const { query } = require('../config/database');
    const sql = `
      SELECT * FROM customers
      WHERE status = 'active'
      ORDER BY total_spent DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }
}

module.exports = new CustomerModel();

