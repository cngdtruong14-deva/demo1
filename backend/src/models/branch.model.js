/**
 * Branch Model
 * Branch data operations
 */

const BaseModel = require('./base.model');

class BranchModel extends BaseModel {
  constructor() {
    super('branches');
  }

  /**
   * Find active branches
   */
  async findActive() {
    return await this.findAll({ status: 'active' });
  }
}

module.exports = new BranchModel();

