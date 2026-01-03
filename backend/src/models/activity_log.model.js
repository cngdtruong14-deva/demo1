/**
 * Activity Log Model (stub)
 */

const BaseModel = require('./base.model');

class ActivityLogModel extends BaseModel {
  constructor() {
    super('activity_logs');
  }
}

module.exports = new ActivityLogModel();

