const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');

/**
 * Verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      req.user = decoded;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  } catch (error) {
    return errorResponse(res, error, error.statusCode || 401);
  }
};

/**
 * Check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 403);
    }
  };
};

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid tokens in optional auth
    }
  }
  
  next();
};

/**
 * Get branch ID from header or user
 */
const getBranchId = (req) => {
  return req.headers['x-branch-id'] || req.user?.branchId || null;
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  getBranchId
};

