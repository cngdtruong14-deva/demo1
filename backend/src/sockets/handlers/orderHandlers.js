const logger = require('../../config/logger');

module.exports = (io, socket) => {
  /**
   * Join order room
   */
  socket.on('order:subscribe', (orderId) => {
    socket.join(`order:${orderId}`);
    logger.info(`Socket ${socket.id} joined order room: ${orderId}`);
  });

  /**
   * Leave order room
   */
  socket.on('order:unsubscribe', (orderId) => {
    socket.leave(`order:${orderId}`);
    logger.info(`Socket ${socket.id} left order room: ${orderId}`);
  });

  /**
   * Join table room
   */
  socket.on('table:join', (tableId) => {
    socket.join(`table:${tableId}`);
    logger.info(`Socket ${socket.id} joined table room: ${tableId}`);
  });

  /**
   * Leave table room
   */
  socket.on('table:leave', (tableId) => {
    socket.leave(`table:${tableId}`);
    logger.info(`Socket ${socket.id} left table room: ${tableId}`);
  });

  /**
   * Join room (generic handler for all room types)
   * Supports: kitchen, table, order, admin
   */
  socket.on('join_room', (data) => {
    const { type, id } = data;
    if (!type || !id) {
      logger.warn(`Invalid join_room request from ${socket.id}:`, data);
      return;
    }
    
    let roomName;
    switch (type) {
      case 'kitchen':
        roomName = `kitchen-${id}`;
        break;
      case 'table':
        roomName = `table:${id}`;
        break;
      case 'order':
        roomName = `order:${id}`;
        break;
      case 'admin':
        roomName = `admin-${id}`;
        break;
      default:
        logger.warn(`Unknown room type: ${type}`);
        return;
    }
    
    socket.join(roomName);
    socket.emit('room_joined', { room: roomName, message: 'Successfully joined room' });
    logger.info(`Socket ${socket.id} joined room: ${roomName}`);
  });

  /**
   * Leave room (generic handler)
   */
  socket.on('leave_room', (data) => {
    const { type, id } = data;
    if (!type || !id) return;
    
    let roomName;
    switch (type) {
      case 'kitchen': roomName = `kitchen-${id}`; break;
      case 'table': roomName = `table:${id}`; break;
      case 'order': roomName = `order:${id}`; break;
      case 'admin': roomName = `admin-${id}`; break;
      default: return;
    }
    
    socket.leave(roomName);
    logger.info(`Socket ${socket.id} left room: ${roomName}`);
  });
};

/**
 * Emit order status update
 */
const emitOrderStatusUpdate = (io, orderId, orderData) => {
  io.to(`order:${orderId}`).emit('order:status_update', orderData);
};

/**
 * Emit order to kitchen
 * Fixed: Use kitchen-{branchId} format for multi-tenancy
 */
const emitOrderToKitchen = (io, orderData) => {
  const branchId = orderData.branchId || orderData.branch_id;
  if (!branchId) {
    logger.error('Cannot emit to kitchen: missing branchId in orderData');
    return;
  }
  const roomName = `kitchen-${branchId}`;
  io.to(roomName).emit('kitchen:new_order', orderData);
  logger.info(`Emitted kitchen:new_order to room: ${roomName}`);
};

/**
 * Emit order item ready
 */
const emitOrderItemReady = (io, orderId, itemData) => {
  io.to(`order:${orderId}`).emit('order:item_ready', itemData);
};

module.exports.emitOrderStatusUpdate = emitOrderStatusUpdate;
module.exports.emitOrderToKitchen = emitOrderToKitchen;
module.exports.emitOrderItemReady = emitOrderItemReady;

