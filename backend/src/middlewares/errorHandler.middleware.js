/**
 * Error Handler Middleware
 * Centralized error handling
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json(errorResponse('Validation error', err.errors, 400));
  }

  // MySQL errors
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        return res.status(409).json(errorResponse('Duplicate entry', null, 409));
      case 'ER_NO_REFERENCED_ROW':
      case 'ER_ROW_IS_REFERENCED':
        return res.status(400).json(errorResponse('Foreign key constraint error', null, 400));
      case 'ER_BAD_FIELD_ERROR':
        return res.status(400).json(errorResponse('Invalid field', null, 400));
      default:
        logger.error('Database error:', err);
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token', null, 401));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token expired', null, 401));
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json(errorResponse(message, null, statusCode));
}

/**
 * 404 handler
 */
function notFound(req, res) {
  res.status(404).json(errorResponse('Route not found', null, 404));
}

module.exports = errorHandler;
module.exports.notFound = notFound;

