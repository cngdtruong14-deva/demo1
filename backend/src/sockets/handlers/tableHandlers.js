const logger = require('../../config/logger');

module.exports = (io, socket) => {
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
};

