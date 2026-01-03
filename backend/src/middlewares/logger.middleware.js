/**
 * Logger Middleware
 * HTTP request logging
 */

const logger = require('../utils/logger');

/**
 * Log HTTP requests
 */
function loggerMiddleware(req, res, next) {
  const start = Date.now();

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}

module.exports = loggerMiddleware;

