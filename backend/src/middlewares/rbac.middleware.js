/**
 * RBAC Middleware
 * Role-Based Access Control
 */

const { sendError } = require('../utils/responseFormatter');
const { USER_ROLES } = require('../utils/constants');

/**
 * Check if user has required role
 */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', null, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        'Access denied. Insufficient permissions',
        { required: allowedRoles, current: req.user.role },
        403
      );
    }

    next();
  };
}

/**
 * Admin only middleware
 */
function adminOnly(req, res, next) {
  return checkRole(USER_ROLES.ADMIN)(req, res, next);
}

/**
 * Admin or Manager middleware
 */
function managerOrAbove(req, res, next) {
  return checkRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER)(req, res, next);
}

/**
 * Kitchen staff middleware
 */
function kitchenStaff(req, res, next) {
  return checkRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.CHEF)(req, res, next);
}

module.exports = {
  checkRole,
  adminOnly,
  managerOrAbove,
  kitchenStaff,
};

