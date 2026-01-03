/**
 * Kitchen Socket Handlers
 * Real-time kitchen display updates
 */

const logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../utils/constants');

module.exports = function (io) {
  io.on('connection', (socket) => {
    /**
     * Join room (generic handler for all room types)
     * Supports: kitchen, table, order, admin
     */
    socket.on('join_room', (data) => {
      const { type, id } = data;
      
      if (!type || !id) {
        logger.warn(`Invalid join_room request from ${socket.id}:`, data);
        socket.emit('error', { message: 'Type and ID are required' });
        return;
      }
      
      let roomName;
      switch (type) {
        case 'kitchen':
          roomName = `kitchen-${id}`;
          break;
        case 'table':
          roomName = `table_${id}`;
          break;
        case 'order':
          roomName = `order:${id}`;
          break;
        case 'admin':
          roomName = `admin-${id}`;
          break;
        default:
          logger.warn(`Unknown room type: ${type}`);
          socket.emit('error', { message: `Unknown room type: ${type}` });
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
        case 'table': roomName = `table_${id}`; break;
        case 'order': roomName = `order:${id}`; break;
        case 'admin': roomName = `admin-${id}`; break;
        default: return;
      }
      
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left room: ${roomName}`);
    });

    /**
     * Join kitchen room
     * Kitchen staff joins to receive new order alerts
     */
    socket.on('join_kitchen', (data) => {
      const { branch_id } = data;
      
      if (!branch_id) {
        socket.emit('error', { message: 'Branch ID required' });
        return;
      }

      socket.join(`kitchen-${branch_id}`);
      logger.info(`Socket ${socket.id} joined kitchen room: kitchen-${branch_id}`);

      socket.emit('joined_kitchen', {
        branch_id,
        message: 'Successfully joined kitchen room',
      });
    });

    /**
     * Leave kitchen room
     */
    socket.on('leave_kitchen', (data) => {
      const { branch_id } = data;
      
      if (branch_id) {
        socket.leave(`kitchen_${branch_id}`);
        logger.info(`Socket ${socket.id} left kitchen room: kitchen_${branch_id}`);
      }
    });

    /**
     * Update item status
     * Kitchen updates the cooking status of an order item
     */
    socket.on('update_item_status', (data) => {
      const { order_id, item_id, status, branch_id } = data;

      // Broadcast to kitchen and branch
      io.to(`kitchen_${branch_id}`).emit(SOCKET_EVENTS.ITEM_STATUS_CHANGE, {
        order_id,
        item_id,
        status,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Item status updated: order_${order_id}, item_${item_id} -> ${status}`);
    });

    /**
     * Order ready notification
     */
    socket.on('order_ready', (data) => {
      const { order_id, table_id, branch_id } = data;

      // Notify table
      io.to(`table_${table_id}`).emit(SOCKET_EVENTS.ORDER_UPDATE, {
        order_id,
        status: 'ready',
        message: 'Your order is ready!',
      });

      // Notify branch
      io.to(`branch_${branch_id}`).emit(SOCKET_EVENTS.KITCHEN_UPDATE, {
        order_id,
        status: 'ready',
      });

      logger.info(`Order ready: order_${order_id}`);
    });
  });
};

