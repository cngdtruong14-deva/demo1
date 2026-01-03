/**
 * Utility Helper Functions
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * Generate UUID
 */
const generateId = () => uuidv4();

/**
 * Generate order number
 * Format: ORD-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${dateStr}-${random}`;
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

/**
 * Calculate pagination
 */
const getPagination = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

/**
 * Build pagination response
 */
const buildPagination = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Sanitize phone number
 */
const sanitizePhone = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Validate email
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 */
const isValidPhone = (phone) => {
  const sanitized = sanitizePhone(phone);
  return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(sanitized);
};

/**
 * Hash string (for simple hashing)
 */
const hashString = (str) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Generate random string
 */
const generateRandomString = (length = 10) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Calculate discount
 */
const calculateDiscount = (subtotal, discountPercentage) => {
  return Math.round((subtotal * discountPercentage) / 100);
};

/**
 * Calculate tax
 */
const calculateTax = (subtotal, taxRate = 10) => {
  return Math.round((subtotal * taxRate) / 100);
};

/**
 * Calculate total
 */
const calculateTotal = (subtotal, discount = 0, tax = 0) => {
  return subtotal - discount + tax;
};

/**
 * Format date to ISO string
 */
const formatDate = (date) => {
  return date ? new Date(date).toISOString() : null;
};

/**
 * Get date range for analytics
 */
const getDateRange = (startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();
  
  // Set time to start/end of day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

/**
 * Deep clone object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove sensitive fields from object
 */
const removeSensitiveFields = (obj, fields = ['password', 'password_hash', 'refresh_token']) => {
  const cloned = deepClone(obj);
  fields.forEach(field => {
    delete cloned[field];
  });
  return cloned;
};

module.exports = {
  generateId,
  generateOrderNumber,
  formatCurrency,
  getPagination,
  buildPagination,
  sanitizePhone,
  isValidEmail,
  isValidPhone,
  hashString,
  generateRandomString,
  calculateDiscount,
  calculateTax,
  calculateTotal,
  formatDate,
  getDateRange,
  deepClone,
  removeSensitiveFields
};

