# API Testing

API testing suite for QR Order Platform backend.

## 📋 Setup

```bash
# Install dependencies
cd testing
npm install

# Configure environment
cp .env.example .env
# Edit .env with your test credentials
```

## 🧪 Running Tests

### Run all tests
```bash
npm run test:api
```

### Run specific test file
```bash
node api-testing/run-tests.js menu
node api-testing/run-tests.js auth
```

### Using Jest (Recommended)

For full test execution, use Jest:

```bash
# Install Jest
npm install --save-dev jest

# Run tests
npx jest api-testing/

# Watch mode
npx jest --watch api-testing/

# Coverage
npx jest --coverage api-testing/
```

## 📝 Test Files

- `menu.test.js` - Menu API endpoints
- `auth.test.js` - Authentication endpoints (to be created)
- `orders.test.js` - Order endpoints (to be created)
- `helpers.js` - Test utilities
- `config.js` - Test configuration

## 🔧 Configuration

Edit `config.js` or set environment variables:

```bash
export API_BASE_URL=http://localhost:5000/api/v1
export TEST_BRANCH_ID=your-branch-uuid
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=admin123
```

## 📊 Test Structure

```javascript
describe('API Endpoint', () => {
  test('should return expected data', async () => {
    const response = await apiClient.get('/endpoint');
    assertResponse(response, 200);
    expect(response.data.data).toHaveProperty('expectedField');
  });
});
```

## 🚀 CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Run API Tests
  run: |
    cd testing
    npm install
    npm run test:api
```

