/**
 * QR Code Service
 * Generate QR codes for tables
 */

const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * Generate QR code as data URL
 */
async function generateQRCode(data, options = {}) {
  try {
    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#FFFFFF',
      },
    };

    const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);
    return qrCodeDataURL;
  } catch (error) {
    logger.error('QR code generation error:', error);
    throw error;
  }
}

/**
 * Generate QR code buffer
 */
async function generateQRCodeBuffer(data, options = {}) {
  try {
    const buffer = await QRCode.toBuffer(data, options);
    return buffer;
  } catch (error) {
    logger.error('QR code buffer generation error:', error);
    throw error;
  }
}

/**
 * Generate table QR code URL
 */
function generateTableQRURL(tableId, branchId) {
  const baseURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseURL}/customer/menu?table_id=${tableId}&branch_id=${branchId}`;
}

module.exports = {
  generateQRCode,
  generateQRCodeBuffer,
  generateTableQRURL,
};

