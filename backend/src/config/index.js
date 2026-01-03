module.exports = {
  app: {
    name: process.env.APP_NAME || 'QR Order Platform',
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    url: process.env.APP_URL || 'http://localhost:5000'
  },
  api: {
    baseUrl: process.env.API_URL || 'http://localhost:5000',
    version: 'v1',
    prefix: '/api/v1'
  },
  frontend: {
    customerUrl: process.env.CUSTOMER_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001'
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: process.env.CORS_CREDENTIALS === 'true' || true
  },
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ]
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  payment: {
    vnpay: {
      tmnCode: process.env.VNPAY_TMN_CODE,
      secretKey: process.env.VNPAY_SECRET_KEY,
      url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNPAY_RETURN_URL,
      apiUrl: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
    },
    momo: {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      apiUrl: process.env.MOMO_API_URL || 'https://test-payment.momo.vn/v2/gateway/api/create',
      returnUrl: process.env.MOMO_RETURN_URL,
      notifyUrl: process.env.MOMO_NOTIFY_URL
    }
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || 'noreply@qrorder.com',
    fromName: process.env.SMTP_FROM_NAME || 'QR Order Platform'
  },
  zalo: {
    oaId: process.env.ZALO_OA_ID,
    accessToken: process.env.ZALO_ACCESS_TOKEN,
    apiUrl: process.env.ZALO_API_URL || 'https://business.openapi.zalo.me'
  },
  features: {
    enablePayment: process.env.ENABLE_PAYMENT === 'true' || true,
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true' || true,
    enableLoyaltyProgram: process.env.ENABLE_LOYALTY_PROGRAM === 'true' || true,
    enableAIRecommendations: process.env.ENABLE_AI_RECOMMENDATIONS === 'true' || false
  }
};

