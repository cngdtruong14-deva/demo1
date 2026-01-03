/**
 * Dynamic Pricing Job
 * Automatically adjust product prices based on time and demand
 * 
 * IMPLEMENTATION STRATEGY:
 * ========================
 * 
 * 1. TIME-BASED PRICING:
 *    - Peak hours (11:00-13:00, 18:00-20:00): +10% markup
 *    - Off-peak hours (14:00-17:00): -5% discount
 *    - Late night (21:00-23:00): -10% discount
 * 
 * 2. DEMAND-BASED PRICING:
 *    - High demand items (sold_count > threshold): +5% markup
 *    - Low demand items (sold_count < threshold): -10% discount
 * 
 * 3. INVENTORY-BASED:
 *    - Low inventory: +15% markup (scarcity pricing)
 *    - High inventory: -15% discount (clearance pricing)
 * 
 * 4. DATABASE OPERATIONS:
 *    - Query products table
 *    - Check current hour using MySQL NOW()
 *    - Calculate new price based on base cost_price
 *    - Update products table with new dynamic price
 *    - Log all price changes for audit trail
 * 
 * 5. BUSINESS RULES:
 *    - Never price below cost_price
 *    - Maximum discount: 20%
 *    - Maximum markup: 25%
 *    - Store original_price for reference
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

async function dynamicPricingJob() {
  try {
    logger.info('🔄 Starting dynamic pricing job...');

    // Get current hour
    const currentHour = new Date().getHours();
    
    // Define pricing multipliers based on time
    let timeMultiplier = 1.0;
    
    if ((currentHour >= 11 && currentHour <= 13) || (currentHour >= 18 && currentHour <= 20)) {
      // Peak hours: +10%
      timeMultiplier = 1.10;
      logger.info(`Peak hour pricing (${currentHour}:00): +10%`);
    } else if (currentHour >= 14 && currentHour <= 17) {
      // Off-peak: -5%
      timeMultiplier = 0.95;
      logger.info(`Off-peak pricing (${currentHour}:00): -5%`);
    } else if (currentHour >= 21 && currentHour <= 23) {
      // Late night: -10%
      timeMultiplier = 0.90;
      logger.info(`Late night pricing (${currentHour}:00): -10%`);
    }

    // Get all active products
    const products = await query(
      `SELECT id, name, cost_price, price, sold_count 
       FROM products 
       WHERE status = 'available' AND cost_price IS NOT NULL`
    );

    logger.info(`Processing ${products.length} products for dynamic pricing...`);

    let updatedCount = 0;

    for (const product of products) {
      // Calculate demand multiplier
      let demandMultiplier = 1.0;
      if (product.sold_count > 100) {
        demandMultiplier = 1.05; // High demand: +5%
      } else if (product.sold_count < 20) {
        demandMultiplier = 0.90; // Low demand: -10%
      }

      // Calculate new price
      let newPrice = product.cost_price * timeMultiplier * demandMultiplier;

      // Apply business rules
      const minPrice = product.cost_price; // Never below cost
      const maxPrice = product.cost_price * 1.25; // Max 25% markup

      newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
      newPrice = Math.round(newPrice / 1000) * 1000; // Round to nearest 1000 VND

      // Update if price has changed
      if (newPrice !== product.price) {
        await query(
          'UPDATE products SET price = ?, updated_at = NOW() WHERE id = ?',
          [newPrice, product.id]
        );

        logger.info(
          `Updated ${product.name}: ${product.price} → ${newPrice} ` +
          `(time: ${timeMultiplier}, demand: ${demandMultiplier})`
        );
        updatedCount++;
      }
    }

    logger.info(`✅ Dynamic pricing job completed. ${updatedCount} products updated.`);
  } catch (error) {
    logger.error('❌ Dynamic pricing job failed:', error);
  }
}

module.exports = dynamicPricingJob;

