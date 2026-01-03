/**
 * Standard API Response Helper
 */

const successResponse = (res, data = null, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

const errorResponse = (res, error, statusCode = 400) => {
  const errorObj = {
    code: error.code || 'SERVER_ERROR',
    message: error.message || 'An error occurred',
    details: error.details || {}
  };

  return res.status(statusCode).json({
    success: false,
    error: errorObj,
    timestamp: new Date().toISOString()
  });
};

const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    message,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};

