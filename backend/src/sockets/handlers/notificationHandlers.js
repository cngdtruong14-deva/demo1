const logger = require('../../config/logger');

module.exports = (io, socket) => {
  /**
   * Join customer notification room
   */
  socket.on('customer:subscribe', (customerId) => {
    socket.join(`customer:${customerId}`);
    logger.info(`Socket ${socket.id} joined customer room: ${customerId}`);
  });

  /**
   * Join admin notification room
   */
  socket.on('admin:subscribe', (branchId) => {
    socket.join(`admin:${branchId}`);
    logger.info(`Socket ${socket.id} joined admin room: ${branchId}`);
  });
};

/**
 * Emit notification to customer
 */
const emitCustomerNotification = (io, customerId, notification) => {
  io.to(`customer:${customerId}`).emit('notification:new', notification);
};

/**
 * Emit notification to admin
 */
const emitAdminNotification = (io, branchId, notification) => {
  io.to(`admin:${branchId}`).emit('notification:new', notification);
};

module.exports.emitCustomerNotification = emitCustomerNotification;
module.exports.emitAdminNotification = emitAdminNotification;

