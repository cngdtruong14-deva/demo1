const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./config/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.app.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use(generalLimiter);

// API routes
app.use(config.api.prefix, routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;

