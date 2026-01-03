const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, email, name, role, branch_id, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(userData) {
    const { email, password, name, role, branchId } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      `INSERT INTO users (id, email, password_hash, name, role, branch_id) 
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [email, passwordHash, name, role, branchId]
    );
    
    return this.findById(result.insertId);
  }

  static async updateRefreshToken(userId, refreshToken) {
    await db.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId]
    );
  }

  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = User;

