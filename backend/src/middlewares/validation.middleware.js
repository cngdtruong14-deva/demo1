/**
 * Validation Middleware
 * Request validation using Joi schemas
 */

const { validate } = require('../utils/validation');
const { sendError } = require('../utils/responseFormatter');

/**
 * Validate request body
 */
function validateBody(schema) {
  return (req, res, next) => {
    const { isValid, errors, value } = validate(schema, req.body);

    if (!isValid) {
      return sendError(res, 'Validation failed', errors, 400);
    }

    // Normalize camelCase to snake_case for backend compatibility
    const normalized = {};
    if (value.tableId) normalized.table_id = value.tableId;
    if (value.table_id) normalized.table_id = value.table_id;
    if (value.branchId) normalized.branch_id = value.branchId;
    if (value.branch_id) normalized.branch_id = value.branch_id;
    if (value.customerId !== undefined) normalized.customer_id = value.customerId;
    if (value.customer_id !== undefined) normalized.customer_id = value.customer_id;
    if (value.paymentMethod) normalized.payment_method = value.paymentMethod;
    if (value.payment_method) normalized.payment_method = value.payment_method;
    if (value.notes !== undefined) normalized.notes = value.notes;
    
    // Normalize items array
    if (value.items) {
      normalized.items = value.items.map(item => ({
        product_id: item.product_id || item.productId,
        quantity: item.quantity,
        notes: item.notes || null
      }));
    }

    req.body = normalized;
    next();
  };
}

/**
 * Validate request query
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { isValid, errors, value } = validate(schema, req.query);

    if (!isValid) {
      return sendError(res, 'Validation failed', errors, 400);
    }

    req.query = value;
    next();
  };
}

/**
 * Validate request params
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { isValid, errors, value } = validate(schema, req.params);

    if (!isValid) {
      return sendError(res, 'Validation failed', errors, 400);
    }

    req.params = value;
    next();
  };
}

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
};

