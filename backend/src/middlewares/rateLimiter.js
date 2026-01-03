const rateLimit = require('express-rate-limit');
const config = require('../config');
const { RateLimitError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const error = new RateLimitError('Too many requests');
    return errorResponse(res, error, 429);
  }
});

/**
 * Auth rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const error = new RateLimitError('Too many authentication attempts');
    return errorResponse(res, error, 429);
  }
});

/**
 * Order creation rate limiter
 */
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 orders per minute
  message: 'Too many order requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const error = new RateLimitError('Too many order requests');
    return errorResponse(res, error, 429);
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  orderLimiter
};

