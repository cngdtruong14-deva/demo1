/**
 * Recommendation Controller
 * AI-powered product recommendations
 */

const { query } = require('../config/database');
const { sendSuccess } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/recommendations/:customerId
 * @desc    Get personalized recommendations for customer
 * @access  Public
 */
async function getRecommendations(req, res, next) {
  try {
    const { customerId } = req.params;
    const { limit = 10 } = req.query;

    // Simple collaborative filtering based on order history
    // In production, this should call an ML service

    // Get customer's past orders
    const pastOrders = await query(
      `SELECT DISTINCT product_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC
       LIMIT 20`,
      [customerId]
    );

    const excludeIds = pastOrders.map((o) => o.product_id);

    // Get popular products not yet ordered
    const recommendations = await query(
      `SELECT 
        p.*,
        c.name as category_name,
        p.sold_count,
        p.rating
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.status = 'available'
         ${excludeIds.length > 0 ? 'AND p.id NOT IN (?)' : ''}
       ORDER BY p.rating DESC, p.sold_count DESC
       LIMIT ?`,
      excludeIds.length > 0 ? [excludeIds, parseInt(limit)] : [parseInt(limit)]
    );

    return sendSuccess(res, recommendations, 'Recommendations retrieved');
  } catch (error) {
    logger.error('Get recommendations error:', error);
    next(error);
  }
}

/**
 * @route   GET /api/v1/recommendations/popular
 * @desc    Get trending/popular products
 * @access  Public
 */
async function getPopularProducts(req, res, next) {
  try {
    const { branch_id, limit = 10 } = req.query;

    const branchCondition = branch_id ? 'WHERE p.branch_id = ?' : '';
    const params = branch_id ? [branch_id, parseInt(limit)] : [parseInt(limit)];

    const popular = await query(
      `SELECT 
        p.*,
        c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${branchCondition}
       ORDER BY p.sold_count DESC, p.rating DESC
       LIMIT ?`,
      params
    );

    return sendSuccess(res, popular, 'Popular products retrieved');
  } catch (error) {
    logger.error('Get popular products error:', error);
    next(error);
  }
}

module.exports = {
  getRecommendations,
  getPopularProducts,
};

