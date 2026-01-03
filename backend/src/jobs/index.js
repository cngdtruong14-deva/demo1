/**
 * Jobs Index
 * Initialize all scheduled jobs
 */

const cron = require('node-cron');
const dynamicPricingJob = require('./dynamicPricing.job');
const inventoryAlertJob = require('./inventoryAlert.job');
const reportGenerationJob = require('./reportGeneration.job');
const logger = require('../utils/logger');

/**
 * Initialize all cron jobs
 */
function initializeJobs() {
  logger.info('Initializing scheduled jobs...');

  // Dynamic Pricing Job - Every hour
  const pricingCron = process.env.DYNAMIC_PRICING_CRON || '0 */1 * * *';
  cron.schedule(pricingCron, () => {
    logger.info('🕐 Running dynamic pricing job...');
    dynamicPricingJob();
  });

  // Inventory Alert Job - Daily at 8 AM
  const inventoryCron = process.env.INVENTORY_ALERT_CRON || '0 8 * * *';
  cron.schedule(inventoryCron, () => {
    logger.info('📦 Running inventory alert job...');
    inventoryAlertJob();
  });

  // Report Generation Job - Daily at midnight
  const reportCron = process.env.REPORT_GENERATION_CRON || '0 0 * * *';
  cron.schedule(reportCron, () => {
    logger.info('📊 Running report generation job...');
    reportGenerationJob();
  });

  logger.info('✅ Scheduled jobs initialized');
  logger.info(`   - Dynamic Pricing: ${pricingCron}`);
  logger.info(`   - Inventory Alert: ${inventoryCron}`);
  logger.info(`   - Report Generation: ${reportCron}`);
}

module.exports = { initializeJobs };
