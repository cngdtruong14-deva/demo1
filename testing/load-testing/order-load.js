// K6 Load Test: Order Creation Endpoint
// Tests the order creation API under load

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 10 },     // Stay at 10 users
    { duration: '30s', target: 20 },    // Ramp up to 20 users
    { duration: '1m', target: 20 },     // Stay at 20 users
    { duration: '30s', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],     // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api/v1';

// Test data
const testOrder = {
  branch_id: 'branch-001',
  table_id: 'table-001',
  items: [
    {
      menu_item_id: 'item-001',
      quantity: 2,
      notes: 'No spicy',
    },
    {
      menu_item_id: 'item-002',
      quantity: 1,
    },
  ],
  payment_method: 'qr',
};

export default function () {
  // Create order
  const createOrderResponse = http.post(
    `${BASE_URL}/orders`,
    JSON.stringify(testOrder),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${__ENV.API_TOKEN || 'test-token'}`,
      },
    }
  );

  const success = check(createOrderResponse, {
    'order created successfully': (r) => r.status === 201 || r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has order ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.id;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!success);

  // Get order status
  if (success && createOrderResponse.status === 201) {
    try {
      const orderBody = JSON.parse(createOrderResponse.body);
      const orderId = orderBody.data.id;

      const getOrderResponse = http.get(`${BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${__ENV.API_TOKEN || 'test-token'}`,
        },
      });

      check(getOrderResponse, {
        'order retrieved successfully': (r) => r.status === 200,
      });
    } catch (e) {
      console.error('Failed to parse order response:', e);
    }
  }

  sleep(1); // Wait 1 second between iterations
}

export function handleSummary(data) {
  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}

