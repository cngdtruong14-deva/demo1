const logger = require('../config/logger');
const { errorResponse } = require('../utils/response');
const { AppError } = require('../utils/errors');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // If error is an instance of AppError, use its properties
  if (err instanceof AppError) {
    return errorResponse(res, err, err.statusCode);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, {
      code: 'AUTH_REQUIRED',
      message: 'Invalid token',
      details: {}
    }, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      code: 'AUTH_REQUIRED',
      message: 'Token expired',
      details: {}
    }, 401);
  }

  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return errorResponse(res, {
      code: 'VALIDATION_ERROR',
      message: err.message || 'Validation error',
      details: {}
    }, 400);
  }

  // Default to 500 server error
  return errorResponse(res, {
    code: 'SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    details: process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}
  }, 500);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, {
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    details: {}
  }, 404);
};

module.exports = {
  errorHandler,
  notFoundHandler
};

