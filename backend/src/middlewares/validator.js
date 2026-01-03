const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');

/**
 * Validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error = new ValidationError('Validation failed', {
      errors: errors.array()
    });
    return errorResponse(res, error, 400);
  }
  
  next();
};

module.exports = {
  validate
};

