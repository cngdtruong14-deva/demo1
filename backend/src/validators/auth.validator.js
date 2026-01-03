/**
 * Auth Validators
 * Joi schemas for authentication
 */

const Joi = require('joi');

/**
 * Register schema
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string()
    .valid('admin', 'manager', 'staff', 'chef', 'waiter', 'cashier', 'customer')
    .default('customer'),
  branch_id: Joi.string().optional().allow(null),
});

/**
 * Login schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};

