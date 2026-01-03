const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  /**
   * POST /auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
          details: {}
        }, 400);
      }

      const result = await AuthService.login(email, password);
      return successResponse(res, result, 'Login successful');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * POST /auth/refresh
   */
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
          details: {}
        }, 400);
      }

      const result = await AuthService.refreshToken(refreshToken);
      return successResponse(res, result, 'Token refreshed successfully');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }

  /**
   * POST /auth/logout
   */
  static async logout(req, res) {
    try {
      const userId = req.user.userId;
      const result = await AuthService.logout(userId);
      return successResponse(res, result, 'Logout successful');
    } catch (error) {
      return errorResponse(res, error, error.statusCode || 500);
    }
  }
}

module.exports = AuthController;

