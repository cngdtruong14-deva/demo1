/**
 * Inventory Model (stub)
 */

const BaseModel = require('./base.model');

class InventoryModel extends BaseModel {
  constructor() {
    super('ingredients');
  }
}

module.exports = new InventoryModel();

