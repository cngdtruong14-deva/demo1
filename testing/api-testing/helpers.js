/**
 * API Testing Helpers
 */

const axios = require('axios');
const config = require('./config');

/**
 * Create axios instance with default config
 */
function createApiClient(token = null) {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeouts.request,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  });

  // Request interceptor for logging
  client.interceptors.request.use(
    (request) => {
      console.log(`→ ${request.method.toUpperCase()} ${request.url}`);
      return request;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging
  client.interceptors.response.use(
    (response) => {
      console.log(`← ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(`✗ ${error.response.status} ${error.config.url}: ${error.response.data.message || error.message}`);
      } else {
        console.error('Response error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Authenticate and get access token
 */
async function authenticate(email, password) {
  const client = createApiClient();
  try {
    const response = await client.post('/auth/login', { email, password });
    return response.data.data.access_token;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Test helper: Assert response structure
 */
function assertResponse(response, expectedStatus = 200) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
  }
  
  if (!response.data) {
    throw new Error('Response data is missing');
  }
  
  if (response.data.success === undefined) {
    throw new Error('Response missing success field');
  }
  
  return true;
}

/**
 * Test helper: Assert response time
 */
function assertPerformance(responseTime, threshold = config.performance.acceptable) {
  if (responseTime > threshold) {
    throw new Error(`Response time ${responseTime}ms exceeds threshold ${threshold}ms`);
  }
  return true;
}

/**
 * Test helper: Wait for async operation
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  createApiClient,
  authenticate,
  assertResponse,
  assertPerformance,
  sleep,
  config
};

