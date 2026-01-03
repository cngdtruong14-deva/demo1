/**
 * Redis Configuration
 * Using ioredis for caching and session management
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
  logger.info('📡 Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client ready');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis client error:', error);
});

redisClient.on('close', () => {
  logger.warn('⚠️  Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Redis client reconnecting...');
});

/**
 * Cache Helper Functions
 */

/**
 * Get value from cache
 */
async function getCache(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
}

/**
 * Set value in cache with optional TTL
 */
async function setCache(key, value, ttl = 3600) {
  try {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redisClient.setex(key, ttl, serialized);
    } else {
      await redisClient.set(key, serialized);
    }
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error);
    return false;
  }
}

/**
 * Delete value from cache
 */
async function deleteCache(key) {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DELETE error:', error);
    return false;
  }
}

/**
 * Delete all keys matching a pattern
 */
async function deleteCachePattern(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis DELETE PATTERN error:', error);
    return false;
  }
}

/**
 * Check if key exists
 */
async function existsCache(key) {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Redis EXISTS error:', error);
    return false;
  }
}

module.exports = redisClient;
module.exports.getCache = getCache;
module.exports.setCache = setCache;
module.exports.deleteCache = deleteCache;
module.exports.deleteCachePattern = deleteCachePattern;
module.exports.existsCache = existsCache;
