/**
 * Pricing Service
 * Dynamic pricing algorithms
 */

const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Calculate dynamic price
 */
function calculateDynamicPrice(basePrice, costPrice, factors = {}) {
  const {
    timeMultiplier = 1.0,
    demandMultiplier = 1.0,
    inventoryMultiplier = 1.0,
  } = factors;

  let newPrice = basePrice * timeMultiplier * demandMultiplier * inventoryMultiplier;

  // Business rules
  const minPrice = costPrice || basePrice * 0.8;
  const maxPrice = basePrice * 1.25;

  newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
  newPrice = Math.round(newPrice / 1000) * 1000; // Round to nearest 1000 VND

  return newPrice;
}

/**
 * Get time-based multiplier
 */
function getTimeMultiplier() {
  const hour = new Date().getHours();

  if ((hour >= 11 && hour <= 13) || (hour >= 18 && hour <= 20)) {
    return 1.10; // Peak hours +10%
  } else if (hour >= 14 && hour <= 17) {
    return 0.95; // Off-peak -5%
  } else if (hour >= 21 && hour <= 23) {
    return 0.90; // Late night -10%
  }

  return 1.0;
}

module.exports = {
  calculateDynamicPrice,
  getTimeMultiplier,
};

