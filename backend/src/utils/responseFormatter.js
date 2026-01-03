/**
 * Response Formatter Utility
 * Standardized API response format
 */

/**
 * Success response
 */
function successResponse(data, message = 'Success', meta = {}) {
  return {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error response
 */
function errorResponse(message = 'An error occurred', errors = null, statusCode = 500) {
  return {
    success: false,
    message,
    errors,
    statusCode,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Pagination metadata
 */
function paginationMeta(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Send success response
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200, meta = {}) {
  return res.status(statusCode).json(successResponse(data, message, meta));
}

/**
 * Send error response
 */
function sendError(res, message = 'An error occurred', errors = null, statusCode = 500) {
  return res.status(statusCode).json(errorResponse(message, errors, statusCode));
}

/**
 * Send paginated response
 */
function sendPaginated(res, data, page, limit, total, message = 'Success') {
  const meta = paginationMeta(page, limit, total);
  return res.status(200).json(successResponse(data, message, meta));
}

module.exports = {
  successResponse,
  errorResponse,
  paginationMeta,
  sendSuccess,
  sendError,
  sendPaginated,
};

