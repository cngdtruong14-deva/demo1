/**
 * Recommendation Service
 * AI-powered product recommendations
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get personalized recommendations for customer
 */
async function getPersonalizedRecommendations(customerId, limit = 10) {
  try {
    // Collaborative filtering based on order history
    const recommendations = await query(
      `SELECT DISTINCT p.*, COUNT(*) as recommendation_score
       FROM products p
       JOIN order_items oi ON p.id = oi.product_id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.customer_id IN (
         SELECT DISTINCT o2.customer_id
         FROM orders o2
         JOIN order_items oi2 ON o2.id = oi2.order_id
         WHERE oi2.product_id IN (
           SELECT product_id FROM order_items oi3
           JOIN orders o3 ON oi3.order_id = o3.id
           WHERE o3.customer_id = ?
         )
         AND o2.customer_id != ?
       )
       AND p.id NOT IN (
         SELECT product_id FROM order_items oi4
         JOIN orders o4 ON oi4.order_id = o4.id
         WHERE o4.customer_id = ?
       )
       AND p.status = 'available'
       GROUP BY p.id
       ORDER BY recommendation_score DESC
       LIMIT ?`,
      [customerId, customerId, customerId, limit]
    );

    return recommendations;
  } catch (error) {
    logger.error('Get personalized recommendations error:', error);
    return [];
  }
}

/**
 * Get trending products
 */
async function getTrendingProducts(branchId, limit = 10) {
  // Get products with high recent sales
  const products = await query(
    `SELECT p.*, COUNT(oi.id) as recent_orders
     FROM products p
     JOIN order_items oi ON p.id = oi.product_id
     JOIN orders o ON oi.order_id = o.id
     WHERE p.branch_id = ?
       AND p.status = 'available'
       AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY p.id
     ORDER BY recent_orders DESC
     LIMIT ?`,
    [branchId, limit]
  );

  return products;
}

module.exports = {
  getPersonalizedRecommendations,
  getTrendingProducts,
};

