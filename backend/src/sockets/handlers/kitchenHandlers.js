const logger = require('../../config/logger');

module.exports = (io, socket) => {
  /**
   * Kitchen marks item as ready
   */
  socket.on('kitchen:item_ready', (data) => {
    const { orderId, itemId } = data;
    logger.info(`Kitchen marked item ${itemId} as ready for order ${orderId}`);
    
    // Emit to order room
    io.to(`order:${orderId}`).emit('order:item_ready', {
      orderId,
      itemId,
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Kitchen updates order status
   */
  socket.on('kitchen:order_status', (data) => {
    const { orderId, status } = data;
    logger.info(`Kitchen updated order ${orderId} status to ${status}`);
    
    // Emit to order room
    io.to(`order:${orderId}`).emit('order:status_update', {
      orderId,
      status,
      timestamp: new Date().toISOString()
    });
  });
};

