/**
 * ============================================
 * Smart Restaurant Backend - Entry Point
 * ============================================
 * This is the main server file that initializes
 * Express, Socket.io, Database, Redis, and Jobs
 * ============================================
 */

require('dotenv').config();
const http = require('http');
const app = require('./src/config/app');
const { initializeSocket } = require('./src/config/socket');
const { testConnection } = require('./src/config/database');
const redisClient = require('./src/config/redis');
const logger = require('./src/utils/logger');
const { initializeJobs } = require('./src/jobs');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);
global.io = io; // Make io globally accessible

/**
 * Initialize all services
 */
async function initializeServices() {
  try {
    // Test Database Connection
    logger.info('🔌 Connecting to MySQL database...');
    await testConnection();
    logger.info('✅ Database connected successfully');

    // Test Redis Connection
    logger.info('🔌 Connecting to Redis...');
    await redisClient.ping();
    logger.info('✅ Redis connected successfully');

    // Initialize Cron Jobs
    logger.info('⏰ Initializing scheduled jobs...');
    initializeJobs();
    logger.info('✅ Jobs initialized successfully');

  } catch (error) {
    logger.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function startServer() {
  try {
    await initializeServices();

    server.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      logger.info(`📡 API listening on port ${PORT}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api/${process.env.API_VERSION}`);
      logger.info(`🔌 Socket.io ready for connections`);
      logger.info('='.repeat(50));
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('✅ HTTP server closed');
    redisClient.quit();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('✅ HTTP server closed');
    redisClient.quit();
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Start the server
startServer();
