/**
 * Custom Error Classes
 */

class AppError extends Error {
  constructor(message, code, statusCode = 400, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}

class DuplicateEntryError extends AppError {
  constructor(resource, field = null) {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    super(message, 'DUPLICATE_ENTRY', 409);
  }
}

class OutOfStockError extends AppError {
  constructor(productName) {
    super(
      `Product "${productName}" is out of stock`,
      'OUT_OF_STOCK',
      400
    );
  }
}

class PaymentError extends AppError {
  constructor(message, details = {}) {
    super(message, 'PAYMENT_FAILED', 402, details);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  DuplicateEntryError,
  OutOfStockError,
  PaymentError,
  RateLimitError
};

