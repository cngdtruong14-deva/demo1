/**
 * Auth Controller
 * Handles authentication and authorization
 */

const { query } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
async function register(req, res, next) {
  try {
    const { email, password, name, role = 'customer', branch_id } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return sendError(res, 'Email already registered', null, 400);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, branch_id, status) 
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [email, password_hash, name, role, branch_id]
    );

    logger.info(`New user registered: ${email}`);

    return sendSuccess(
      res,
      { id: result.insertId, email, name, role },
      'User registered successfully',
      201
    );
  } catch (error) {
    logger.error('Register error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT
 * @access  Public
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user
    const users = await query(
      `SELECT id, email, password_hash, name, role, branch_id, status 
       FROM users WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    const user = users[0];

    // Check if user is active
    if (user.status !== 'active') {
      return sendError(res, 'Account is inactive', null, 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    // Generate tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      branch_id: user.branch_id,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    logger.info(`User logged in: ${email}`);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          branch_id: user.branch_id,
        },
        accessToken,
        refreshToken,
      },
      'Login successful'
    );
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token required', null, 400);
    }

    // Verify refresh token (handled in middleware)
    const payload = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      branch_id: req.user.branch_id,
    };

    const newAccessToken = generateAccessToken(payload);

    return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    logger.error('Refresh token error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
async function logout(req, res, next) {
  try {
    // In a production environment, you might want to blacklist the token
    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
async function getMe(req, res, next) {
  try {
    const users = await query(
      `SELECT id, email, name, role, branch_id, status, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return sendError(res, 'User not found', null, 404);
    }

    return sendSuccess(res, users[0], 'User profile retrieved');
  } catch (error) {
    logger.error('Get me error:', error);
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};

