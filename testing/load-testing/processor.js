/**
 * Artillery Load Testing Processor
 * Custom functions for load testing scenarios
 */

/**
 * Generate random branch ID (if not provided)
 */
function generateBranchId(context, events, done) {
  if (!context.vars.branchId) {
    // Generate a random UUID-like string for testing
    context.vars.branchId = 'test-branch-' + Math.random().toString(36).substr(2, 9);
  }
  return done();
}

/**
 * Extract product ID from menu response
 */
function extractProductId(requestParams, context, events, done) {
  if (context.vars.menuResponse && context.vars.menuResponse.data) {
    const categories = context.vars.menuResponse.data.categories || [];
    if (categories.length > 0) {
      const products = categories[0].products || [];
      if (products.length > 0) {
        context.vars.productId = products[0].id;
      }
    }
  }
  return done();
}

/**
 * Calculate response time metrics
 */
function logResponseTime(requestParams, response, context, events, done) {
  if (response.timings) {
    const responseTime = response.timings.response;
    events.emit('histogram', 'response_time', responseTime);
    
    // Log slow requests
    if (responseTime > 1000) {
      events.emit('counter', 'slow_requests', 1);
    }
  }
  return done();
}

module.exports = {
  generateBranchId,
  extractProductId,
  logResponseTime
};

