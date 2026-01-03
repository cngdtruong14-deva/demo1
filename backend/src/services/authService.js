const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');
const { UnauthorizedError, ValidationError } = require('../utils/errors');

class AuthService {
  /**
   * Login user
   */
  static async login(email, password) {
    const user = await User.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is inactive');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token
    await User.updateRefreshToken(user.id, refreshToken);

    // Remove sensitive fields
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branchId: user.branch_id
    };

    return {
      accessToken,
      refreshToken,
      user: userData
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user || user.refresh_token !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.generateAccessToken(user);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId) {
    await User.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  /**
   * Generate access token
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        branchId: user.branch_id
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      jwtConfig.refreshSecret,
      {
        expiresIn: jwtConfig.refreshExpiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    );
  }
}

module.exports = AuthService;

