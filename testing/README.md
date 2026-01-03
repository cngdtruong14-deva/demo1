# Testing Directory

Comprehensive testing suite for QR Order Platform.

## 📁 Structure

```
testing/
├── api-testing/      # API endpoint tests
├── e2e/              # End-to-end tests (Playwright)
├── load-testing/     # Load and performance tests (Artillery)
└── package.json      # Testing dependencies
```

## 🧪 Test Types

### 1. API Testing

Tests for backend API endpoints.

```bash
cd testing
npm run test:api
```

**Location:** `api-testing/`
- `menu.test.js` - Menu API tests
- `helpers.js` - Test utilities
- `config.js` - Test configuration

**See:** [API Testing README](./api-testing/README.md)

### 2. E2E Testing

End-to-end tests using Playwright.

```bash
cd testing
npm run test:e2e
```

**Location:** `e2e/`
- `tests/menu.spec.js` - Menu browsing tests
- `playwright.config.js` - Playwright configuration

**See:** [E2E Testing README](./e2e/README.md)

### 3. Load Testing

Performance and load testing using Artillery.

```bash
cd testing
npm run test:load
```

**Location:** `load-testing/`
- `scenarios.yml` - Load test scenarios
- `processor.js` - Custom test functions

**See:** [Load Testing README](./load-testing/README.md)

## 🚀 Quick Start

### Install Dependencies

```bash
cd testing
npm install

# Install Playwright browsers
npx playwright install
```

### Run All Tests

```bash
# API tests
npm run test:api

# E2E tests
npm run test:e2e

# Load tests
npm run test:load

# All tests
npm run test:all
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in `testing/`:

```bash
# API Configuration
API_BASE_URL=http://localhost:5000/api/v1
TEST_BRANCH_ID=your-branch-uuid

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Test Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
CUSTOMER_EMAIL=customer@example.com
CUSTOMER_PASSWORD=customer123
```

## 📊 Test Coverage

### Current Coverage

- ✅ Menu API endpoints
- ✅ Menu browsing (E2E)
- ✅ Load testing scenarios
- ⏳ Order API (to be added)
- ⏳ Authentication (to be added)
- ⏳ Cart functionality (to be added)

### Coverage Goals

- **Unit Tests:** > 80% (backend)
- **Integration Tests:** Critical paths covered
- **E2E Tests:** Main user flows
- **Load Tests:** Performance benchmarks met

## 🎯 Performance Targets

Based on system design requirements:

- **API Response Time (p95):** < 500ms
- **Error Rate:** < 1%
- **Throughput:** > 100 req/s
- **Concurrent Users:** 1,000+

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: |
          cd testing
          npm install
          npm run test:api

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: microsoft/playwright@v1
      - run: |
          cd testing
          npm install
          npm run test:e2e
```

## 📚 Related Documentation

- [Setup Guide](../docs/development/setup-guide.md#bước-8-testing)
- [System Design - Testing Strategy](../docs/architecture/system-design.md#15-testing-strategy)
- [Coding Standards - Testing](../docs/development/coding-standards.md#testing)

