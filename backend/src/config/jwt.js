/**
 * JWT Configuration
 * Token generation and verification utilities
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate access token
 */
function generateAccessToken(payload) {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'restaurant-api',
      audience: 'restaurant-client',
    });
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw error;
  }
}

/**
 * Generate refresh token
 */
function generateRefreshToken(payload) {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'restaurant-api',
      audience: 'restaurant-client',
    });
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'restaurant-api',
      audience: 'restaurant-client',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'restaurant-api',
      audience: 'restaurant-client',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
