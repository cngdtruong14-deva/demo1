/**
 * Table Model
 * Table data operations
 */

const BaseModel = require('./base.model');

class TableModel extends BaseModel {
  constructor() {
    super('tables');
  }

  /**
   * Find tables by branch
   */
  async findByBranch(branchId) {
    return await this.findAll({ branch_id: branchId });
  }

  /**
   * Find available tables
   */
  async findAvailable(branchId) {
    return await this.findAll({ branch_id: branchId, status: 'available' });
  }

  /**
   * Update table status
   */
  async updateStatus(tableId, status) {
    return await this.update(tableId, { status });
  }
}

module.exports = new TableModel();

