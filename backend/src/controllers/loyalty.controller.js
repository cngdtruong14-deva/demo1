/**
 * Loyalty Controller
 * Loyalty program and points management
 */

const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/loyalty/:customerId
 * @desc    Get loyalty points for customer
 * @access  Private
 */
async function getLoyaltyPoints(req, res, next) {
  try {
    const { customerId } = req.params;

    const [loyalty] = await query(
      'SELECT * FROM loyalty_points WHERE customer_id = ?',
      [customerId]
    );

    if (!loyalty) {
      return sendError(res, 'Loyalty account not found', null, 404);
    }

    return sendSuccess(res, loyalty, 'Loyalty points retrieved');
  } catch (error) {
    logger.error('Get loyalty points error:', error);
    next(error);
  }
}

/**
 * @route   POST /api/v1/loyalty/earn
 * @desc    Add loyalty points
 * @access  Private
 */
async function earnPoints(req, res, next) {
  try {
    const { customer_id, points, order_id } = req.body;

    // Check if loyalty account exists
    const existing = await query(
      'SELECT id FROM loyalty_points WHERE customer_id = ?',
      [customer_id]
    );

    if (existing.length === 0) {
      // Create new loyalty account
      await query(
        `INSERT INTO loyalty_points (customer_id, points, points_earned, tier)
         VALUES (?, ?, ?, 'bronze')`,
        [customer_id, points, points]
      );
    } else {
      // Update existing account
      await query(
        `UPDATE loyalty_points 
         SET points = points + ?,
             points_earned = points_earned + ?,
             last_transaction_date = NOW()
         WHERE customer_id = ?`,
        [points, points, customer_id]
      );
    }

    logger.info(`Loyalty points earned: Customer ${customer_id}, Points: ${points}`);

    return sendSuccess(res, { customer_id, points }, 'Points added successfully');
  } catch (error) {
    logger.error('Earn points error:', error);
    next(error);
  }
}

module.exports = {
  getLoyaltyPoints,
  earnPoints,
};

