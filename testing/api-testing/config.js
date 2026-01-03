/**
 * API Testing Configuration
 */

module.exports = {
  // API Base URL
  baseURL: process.env.API_BASE_URL || 'http://localhost:5000/api/v1',
  
  // Test credentials
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    },
    customer: {
      email: process.env.CUSTOMER_EMAIL || 'customer@example.com',
      password: process.env.CUSTOMER_PASSWORD || 'customer123'
    }
  },
  
  // Test data
  testData: {
    branchId: process.env.TEST_BRANCH_ID || null,
    tableId: process.env.TEST_TABLE_ID || null
  },
  
  // Timeouts
  timeouts: {
    request: 10000, // 10 seconds
    response: 5000  // 5 seconds
  },
  
  // Expected response times (ms)
  performance: {
    fast: 200,
    acceptable: 500,
    slow: 1000
  }
};

