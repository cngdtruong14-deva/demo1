/**
 * Email Service
 * Send emails using Nodemailer
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email
 */
async function sendEmail(to, subject, html, text = null) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      text: text || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(order, customer) {
  const subject = `Xác nhận đơn hàng #${order.order_number}`;
  const html = `
    <h2>Cảm ơn bạn đã đặt hàng!</h2>
    <p>Đơn hàng của bạn đã được xác nhận.</p>
    <p><strong>Mã đơn hàng:</strong> ${order.order_number}</p>
    <p><strong>Tổng tiền:</strong> ${order.total.toLocaleString('vi-VN')} VNĐ</p>
  `;

  return await sendEmail(customer.email, subject, html);
}

module.exports = {
  sendEmail,
  sendOrderConfirmation,
};

