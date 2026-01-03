/**
 * Auth Routes
 * Authentication and authorization endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', validateBody(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;

