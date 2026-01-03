/**
 * Notification Service
 * Send notifications via various channels
 */

const logger = require('../utils/logger');

/**
 * Send push notification
 */
async function sendPushNotification(userId, title, message, data = {}) {
  // Push notification stub (Firebase, OneSignal, etc.)
  logger.info(`Push notification sent to user ${userId}: ${title}`);
  
  // In production, integrate with actual push notification service
  return { success: true };
}

/**
 * Send SMS notification
 */
async function sendSMS(phone, message) {
  // SMS service stub (Twilio, AWS SNS, etc.)
  logger.info(`SMS sent to ${phone}: ${message}`);
  
  return { success: true };
}

/**
 * Send in-app notification
 */
async function sendInAppNotification(userId, notification) {
  // Store in database and emit via socket
  const { query } = require('../config/database');
  
  await query(
    `INSERT INTO notifications 
     (recipient_type, recipient_id, title, message, type, channel, status)
     VALUES ('customer', ?, ?, ?, ?, 'in_app', 'pending')`,
    [userId, notification.title, notification.message, notification.type || 'system']
  );

  // Emit via socket if available
  if (global.io) {
    global.io.to(`user_${userId}`).emit('notification', notification);
  }

  logger.info(`In-app notification sent to user ${userId}`);
  return { success: true };
}

/**
 * Send order notification
 */
async function sendOrderNotification(order, type) {
  const messages = {
    created: 'Đơn hàng của bạn đã được tạo thành công',
    confirmed: 'Đơn hàng đã được xác nhận',
    preparing: 'Đơn hàng đang được chuẩn bị',
    ready: 'Đơn hàng của bạn đã sẵn sàng',
    completed: 'Cảm ơn bạn đã sử dụng dịch vụ',
  };

  const message = messages[type] || 'Cập nhật đơn hàng';

  // Send to customer
  if (order.customer_id) {
    await sendInAppNotification(order.customer_id, {
      title: 'Cập nhật đơn hàng',
      message,
      type: 'order',
      data: { order_id: order.id },
    });
  }

  return { success: true };
}

module.exports = {
  sendPushNotification,
  sendSMS,
  sendInAppNotification,
  sendOrderNotification,
};

