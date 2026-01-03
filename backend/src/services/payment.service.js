/**
 * Payment Service
 * Handle payment integrations (VNPay, Momo, etc.)
 */

const crypto = require('crypto');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Create VNPay payment URL
 * @param {string} orderId - Order ID
 * @param {number} amount - Amount in VND
 * @param {string} orderInfo - Order description
 * @param {string} ipAddr - Customer IP address
 * @returns {string} Payment URL
 */
function createVNPayPaymentURL(orderId, amount, orderInfo = 'Thanh toan don hang', ipAddr = '127.0.0.1') {
  const vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const vnpTmnCode = process.env.VNPAY_TMN_CODE;
  const vnpSecretKey = process.env.VNPAY_SECRET_KEY;
  const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/callback';

  if (!vnpTmnCode || !vnpSecretKey) {
    logger.warn('VNPay credentials not configured');
    return null;
  }

  const date = new Date();
  const createDate = date.toISOString().replace(/[-:]/g, '').split('.')[0] + '00';
  const expireDate = new Date(date.getTime() + 15 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + '00';

  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: vnpTmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // Convert to cents
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate
  };

  // Sort params and create query string
  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {});

  const querystring = require('querystring');
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnpSecretKey);
  const signed = hmac.update(signData, 'utf-8').digest('hex');

  sortedParams.vnp_SecureHash = signed;

  const paymentURL = vnpUrl + '?' + querystring.stringify(sortedParams, { encode: false });

  logger.info(`VNPay payment URL created for order ${orderId}`);
  return paymentURL;
}

/**
 * Verify VNPay callback
 * @param {object} queryParams - Query parameters from callback
 * @returns {object} Verification result
 */
function verifyVNPayCallback(queryParams) {
  const vnpSecretKey = process.env.VNPAY_SECRET_KEY;
  const vnpSecureHash = queryParams.vnp_SecureHash;

  delete queryParams.vnp_SecureHash;
  delete queryParams.vnp_SecureHashType;

  // Sort params
  const sortedParams = Object.keys(queryParams)
    .sort()
    .reduce((acc, key) => {
      if (queryParams[key]) {
        acc[key] = queryParams[key];
      }
      return acc;
    }, {});

  const querystring = require('querystring');
  const signData = querystring.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac('sha512', vnpSecretKey);
  const signed = hmac.update(signData, 'utf-8').digest('hex');

  const isValid = signed === vnpSecureHash;
  const responseCode = queryParams.vnp_ResponseCode;

  return {
    isValid,
    success: isValid && responseCode === '00',
    orderId: queryParams.vnp_TxnRef,
    amount: parseInt(queryParams.vnp_Amount) / 100,
    transactionId: queryParams.vnp_TransactionNo,
    responseCode,
    message: queryParams.vnp_ResponseMessage
  };
}

/**
 * Create Momo payment
 * @param {string} orderId - Order ID
 * @param {number} amount - Amount in VND
 * @param {string} orderInfo - Order description
 * @returns {Promise<object>} Payment result
 */
async function createMomoPayment(orderId, amount, orderInfo = 'Thanh toan don hang') {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';

  if (!partnerCode || !accessKey || !secretKey) {
    logger.warn('Momo credentials not configured');
    return { success: false, error: 'Momo credentials not configured' };
  }

  const requestId = `${partnerCode}${Date.now()}`;
  const orderId_momo = orderId;
  const orderInfo_momo = orderInfo;
  const redirectUrl = process.env.MOMO_RETURN_URL || 'http://localhost:3000/payment/callback';
  const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/v1/payments/momo/callback';
  const extraData = '';

  // Create raw signature
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId_momo}&orderInfo=${orderInfo_momo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

  const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: 'Restaurant',
    storeId: 'MomoTestStore',
    requestId,
    amount,
    orderId: orderId_momo,
    orderInfo: orderInfo_momo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    extraData,
    requestType: 'captureWallet',
    autoCapture: true,
    orderGroupId: '',
    signature
  };

  try {
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.resultCode === 0) {
      logger.info(`Momo payment URL created for order ${orderId}`);
      return {
        success: true,
        paymentURL: response.data.payUrl,
        orderId: response.data.orderId,
        requestId: response.data.requestId
      };
    } else {
      logger.error(`Momo payment failed: ${response.data.message}`);
      return {
        success: false,
        error: response.data.message
      };
    }
  } catch (error) {
    logger.error('Momo payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify Momo callback
 * @param {object} callbackData - Callback data from Momo
 * @returns {object} Verification result
 */
function verifyMomoCallback(callbackData) {
  const secretKey = process.env.MOMO_SECRET_KEY;
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = callbackData;

  // Create raw signature
  const rawSignature = `accessKey=${process.env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

  const calculatedSignature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  const isValid = calculatedSignature === signature;

  return {
    isValid,
    success: isValid && resultCode === 0,
    orderId,
    amount,
    transactionId: transId,
    resultCode,
    message
  };
}

module.exports = {
  createVNPayPaymentURL,
  verifyVNPayCallback,
  createMomoPayment,
  verifyMomoCallback
};
