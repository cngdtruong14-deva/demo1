/**
 * Socket.io Handlers Index
 * Initialize all socket event handlers
 */

const orderSocket = require('./order.socket');
const kitchenSocket = require('./kitchen.socket');
const notificationSocket = require('./notification.socket');
const logger = require('../utils/logger');

/**
 * Initialize all socket handlers
 */
function initializeSocketHandlers(io) {
  logger.info('Initializing socket handlers...');

  // Order socket
  orderSocket(io);

  // Kitchen socket
  kitchenSocket(io);

  // Notification socket
  notificationSocket(io);

  logger.info('✅ Socket handlers initialized');
}

module.exports = initializeSocketHandlers;
