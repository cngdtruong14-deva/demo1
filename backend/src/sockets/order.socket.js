/**
 * Order Socket Handlers
 * Real-time order events
 */

const logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../utils/constants');

module.exports = function (io) {
  io.on('connection', (socket) => {
    /**
     * Join table room
     * Customer joins a room for their table to receive order updates
     */
    socket.on('join_table', (data) => {
      const { table_id } = data;
      
      if (!table_id) {
        socket.emit('error', { message: 'Table ID required' });
        return;
      }

      socket.join(`table_${table_id}`);
      logger.info(`Socket ${socket.id} joined table room: table_${table_id}`);

      socket.emit('joined_table', {
        table_id,
        message: 'Successfully joined table room',
      });
    });

    /**
     * Leave table room
     */
    socket.on('leave_table', (data) => {
      const { table_id } = data;
      
      if (table_id) {
        socket.leave(`table_${table_id}`);
        logger.info(`Socket ${socket.id} left table room: table_${table_id}`);
      }
    });

    /**
     * Join branch room (for branch-wide notifications)
     */
    socket.on('join_branch', (data) => {
      const { branch_id } = data;
      
      if (!branch_id) {
        socket.emit('error', { message: 'Branch ID required' });
        return;
      }

      socket.join(`branch_${branch_id}`);
      logger.info(`Socket ${socket.id} joined branch room: branch_${branch_id}`);
    });

    /**
     * Place order event (optional, could be done via HTTP)
     */
    socket.on('place_order', (data) => {
      const { table_id, branch_id, items } = data;

      // Emit to branch room (kitchen, admin)
      io.to(`branch_${branch_id}`).emit(SOCKET_EVENTS.NEW_ORDER, {
        table_id,
        items,
        timestamp: new Date().toISOString(),
      });

      logger.info(`New order placed: table_${table_id}`);
    });
  });
};

