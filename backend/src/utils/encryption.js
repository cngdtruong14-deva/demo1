/**
 * Encryption Utility
 * Password hashing and comparison using bcrypt
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate random string
 */
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate UUID
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Hash data using SHA256
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomString,
  generateUUID,
  sha256,
};

