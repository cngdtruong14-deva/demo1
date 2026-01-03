/**
 * Menu API Tests
 */

const { createApiClient, assertResponse, assertPerformance, config } = require('./helpers');

describe('Menu API Tests', () => {
  let apiClient;
  let branchId;

  beforeAll(() => {
    apiClient = createApiClient();
    branchId = config.testData.branchId;
    
    if (!branchId) {
      throw new Error('TEST_BRANCH_ID environment variable is required');
    }
  });

  describe('GET /menu/:branchId', () => {
    test('should return menu with categories and products', async () => {
      const startTime = Date.now();
      const response = await apiClient.get(`/menu/${branchId}`);
      const responseTime = Date.now() - startTime;

      assertResponse(response, 200);
      assertPerformance(responseTime);

      const { data } = response.data;
      
      // Assert structure
      expect(data).toHaveProperty('branch');
      expect(data).toHaveProperty('categories');
      expect(data).toHaveProperty('metadata');
      
      // Assert branch
      expect(data.branch).toHaveProperty('id');
      expect(data.branch).toHaveProperty('name');
      
      // Assert categories
      expect(Array.isArray(data.categories)).toBe(true);
      
      if (data.categories.length > 0) {
        const category = data.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('products');
        expect(Array.isArray(category.products)).toBe(true);
        
        // Assert products
        if (category.products.length > 0) {
          const product = category.products[0];
          expect(product).toHaveProperty('id');
          expect(product).toHaveProperty('name');
          expect(product).toHaveProperty('price');
          expect(typeof product.price).toBe('number');
        }
      }
    });

    test('should filter by status', async () => {
      const response = await apiClient.get(`/menu/${branchId}`, {
        params: { status: 'available' }
      });

      assertResponse(response, 200);
      
      // All products should be available
      response.data.data.categories.forEach(category => {
        category.products.forEach(product => {
          expect(product.status).toBe('available');
        });
      });
    });

    test('should search products', async () => {
      const response = await apiClient.get(`/menu/${branchId}`, {
        params: { search: 'phở' }
      });

      assertResponse(response, 200);
      
      // At least one product should match search
      const hasMatchingProduct = response.data.data.categories.some(category =>
        category.products.some(product =>
          product.name.toLowerCase().includes('phở')
        )
      );
      
      expect(hasMatchingProduct).toBe(true);
    });

    test('should return 404 for invalid branch ID', async () => {
      try {
        await apiClient.get('/menu/invalid-branch-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('GET /menu/:branchId/summary', () => {
    test('should return menu summary', async () => {
      const response = await apiClient.get(`/menu/${branchId}/summary`);

      assertResponse(response, 200);
      
      const { data } = response.data;
      expect(data).toHaveProperty('branch');
      expect(data).toHaveProperty('categories');
      expect(Array.isArray(data.categories)).toBe(true);
      
      if (data.categories.length > 0) {
        const category = data.categories[0];
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('product_count');
        expect(typeof category.product_count).toBe('number');
      }
    });
  });
});

// Export for use with test runner
if (require.main === module) {
  // Run tests if executed directly
  const { runTests } = require('./run-tests');
  runTests(module.exports);
}

module.exports = describe;

