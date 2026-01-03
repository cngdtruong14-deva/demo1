/**
 * Express Application Configuration
 * Middleware setup and route mounting
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const routes = require('../routes');
const errorHandler = require('../middlewares/errorHandler.middleware');
const logger = require('../utils/logger');

const app = express();

// ============================================
// Security Middleware
// ============================================
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false,
}));

// ============================================
// CORS Configuration
// ============================================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',  // Next.js Customer
      'http://localhost:3001',  // React Admin (if on 3001)
      'http://localhost:5173',  // Vite Admin (default)
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// ============================================
// Body Parsing Middleware
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// Compression
// ============================================
app.use(compression());

// ============================================
// Logging Middleware
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ============================================
// API Routes
// ============================================
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}`, routes);

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// ============================================
// Error Handler Middleware
// ============================================
app.use(errorHandler);

module.exports = app;

