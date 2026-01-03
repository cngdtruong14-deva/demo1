/**
 * Recipe Model (stub)
 */

const BaseModel = require('./base.model');

class RecipeModel extends BaseModel {
  constructor() {
    super('recipes');
  }
}

module.exports = new RecipeModel();

