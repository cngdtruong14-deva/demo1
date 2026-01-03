/**
 * Order Integration Tests
 * Tests order creation flow with database
 */

const request = require('supertest');
const app = require('../../src/config/app');

describe('Order API Integration', () => {
  let authToken;
  let tableId;
  let branchId;
  let productId;

  beforeAll(async () => {
    // Setup test data
    // This would typically use a test database
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        table_id: tableId,
        branch_id: branchId,
        items: [
          {
            product_id: productId,
            quantity: 2,
            notes: 'No spicy',
          },
        ],
        payment_method: 'cash',
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('order_number');
      expect(response.body.data).toHaveProperty('total');
    });

    it('should reject order with invalid table_id', async () => {
      const orderData = {
        table_id: 'invalid-id',
        branch_id: branchId,
        items: [{ product_id: productId, quantity: 1 }],
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should get order by ID', async () => {
      // First create an order
      const orderData = {
        table_id: tableId,
        branch_id: branchId,
        items: [{ product_id: productId, quantity: 1 }],
      };

      const createResponse = await request(app)
        .post('/api/v1/orders')
        .send(orderData);

      const orderId = createResponse.body.data.id;

      // Then get it
      const response = await request(app)
        .get(`/api/v1/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
    });
  });
});

