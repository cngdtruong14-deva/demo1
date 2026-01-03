/**
 * Notification Socket Handlers
 * Real-time notifications
 */

const logger = require('../utils/logger');
const { SOCKET_EVENTS } = require('../utils/constants');

module.exports = function (io) {
  io.on('connection', (socket) => {
    /**
     * Join user's personal notification room
     */
    socket.on('join_notifications', (data) => {
      const { user_id } = data;
      
      if (!user_id) {
        socket.emit('error', { message: 'User ID required' });
        return;
      }

      socket.join(`user_${user_id}`);
      logger.info(`Socket ${socket.id} joined notification room: user_${user_id}`);
    });

    /**
     * Mark notification as read
     */
    socket.on('mark_notification_read', (data) => {
      const { notification_id, user_id } = data;

      // Update in database (this should be done via API)
      logger.info(`Notification marked as read: ${notification_id} by user ${user_id}`);
    });
  });

  /**
   * Helper function to send notification to specific user
   */
  io.sendNotification = function (user_id, notification) {
    io.to(`user_${user_id}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
  };

  /**
   * Helper function to broadcast notification to branch
   */
  io.broadcastToBranch = function (branch_id, notification) {
    io.to(`branch_${branch_id}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
  };
};

