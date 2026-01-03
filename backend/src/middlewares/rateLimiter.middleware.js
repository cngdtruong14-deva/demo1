/**
 * Rate Limiter Middleware
 * Protect against abuse and DDoS
 */

const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
  },
  skipSuccessfulRequests: true,
});

/**
 * Order creation rate limiter
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 orders per minute
  message: {
    success: false,
    message: 'Too many orders created, please slow down',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter,
};

