/**
 * Validation Utility
 * Common validation functions
 */

const Joi = require('joi');

/**
 * Validate data against Joi schema
 */
function validate(schema, data) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return { isValid: false, errors, value: null };
  }

  return { isValid: true, errors: null, value };
}

/**
 * Check if value is a valid UUID
 */
function isValidUUID(value) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if value is a valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if value is a valid phone number (Vietnamese format)
 */
function isValidPhone(phone) {
  const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Sanitize string input
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Check if value is empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

module.exports = {
  validate,
  isValidUUID,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  isEmpty,
};

