/**
 * Base Model
 * Base class for all models with common methods
 */

const { query, getConnection } = require('../config/database');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  /**
   * Find all records
   */
  async findAll(conditions = {}, options = {}) {
    const { limit = 100, offset = 0, orderBy = 'created_at DESC' } = options;
    
    let whereClause = '';
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereParts = Object.keys(conditions).map((key) => {
        params.push(conditions[key]);
        return `${key} = ?`;
      });
      whereClause = 'WHERE ' + whereParts.join(' AND ');
    }

    const sql = `
      SELECT * FROM ${this.tableName}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    return await query(sql, [...params, limit, offset]);
  }

  /**
   * Find by ID
   */
  async findById(id) {
    const results = await query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find one record by conditions
   */
  async findOne(conditions) {
    const whereParts = Object.keys(conditions).map((key) => `${key} = ?`);
    const whereClause = whereParts.join(' AND ');
    const params = Object.values(conditions);

    const results = await query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`,
      params
    );
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create new record
   */
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    
    return await this.findById(result.insertId);
  }

  /**
   * Update record by ID
   */
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setParts = keys.map((key) => `${key} = ?`);

    const sql = `UPDATE ${this.tableName} SET ${setParts.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await query(sql, [...values, id]);
    
    return await this.findById(id);
  }

  /**
   * Delete record by ID
   */
  async delete(id) {
    const result = await query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Count records
   */
  async count(conditions = {}) {
    let whereClause = '';
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereParts = Object.keys(conditions).map((key) => {
        params.push(conditions[key]);
        return `${key} = ?`;
      });
      whereClause = 'WHERE ' + whereParts.join(' AND ');
    }

    const results = await query(
      `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`,
      params
    );
    return results[0].count;
  }
}

module.exports = BaseModel;

