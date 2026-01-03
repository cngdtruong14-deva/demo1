/**
 * Inventory Alert Job
 * Check inventory levels and send alerts for low stock
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

async function inventoryAlertJob() {
  try {
    logger.info('📦 Checking inventory levels...');

    // Get ingredients with low stock
    const lowStockItems = await query(
      `SELECT id, name, stock_quantity, min_stock_level, unit
       FROM ingredients
       WHERE stock_quantity <= min_stock_level
         AND status != 'out_of_stock'
       ORDER BY stock_quantity ASC`
    );

    if (lowStockItems.length === 0) {
      logger.info('✅ All inventory levels are sufficient');
      return;
    }

    logger.warn(`⚠️  Found ${lowStockItems.length} items with low stock:`);

    for (const item of lowStockItems) {
      logger.warn(
        `  - ${item.name}: ${item.stock_quantity}${item.unit} ` +
        `(min: ${item.min_stock_level}${item.unit})`
      );

      // Update status to low_stock
      await query(
        'UPDATE ingredients SET status = "low_stock" WHERE id = ?',
        [item.id]
      );

      // TODO: Send notification to managers
      // - Email notification
      // - SMS alert
      // - Push notification to admin app
    }

    logger.info(`✅ Inventory alert job completed`);
  } catch (error) {
    logger.error('❌ Inventory alert job failed:', error);
  }
}

module.exports = inventoryAlertJob;

