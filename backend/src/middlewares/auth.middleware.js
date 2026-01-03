/**
 * Authentication Middleware
 * Verify JWT and attach user to request
 */

const { verifyAccessToken } = require('../config/jwt');
const { sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * Authenticate JWT token
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', null, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.message === 'Token expired') {
        return sendError(res, 'Token expired', null, 401);
      }
      return sendError(res, 'Invalid token', null, 401);
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return sendError(res, 'Authentication failed', null, 401);
  }
}

/**
 * Optional authentication (doesn't fail if no token)
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuth,
};

