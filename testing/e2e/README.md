# E2E Testing with Playwright

End-to-end testing for QR Order Platform using Playwright.

## 📋 Setup

```bash
# Install dependencies
cd testing
npm install

# Install Playwright browsers
npx playwright install
```

## 🧪 Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run with UI mode
```bash
npm run test:e2e:ui
```

### Run specific test file
```bash
npx playwright test tests/menu.spec.js
```

### Run in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## 📝 Test Files

- `tests/menu.spec.js` - Menu browsing and product selection
- `tests/order.spec.js` - Order placement flow (to be created)
- `tests/cart.spec.js` - Shopping cart functionality (to be created)
- `tests/checkout.spec.js` - Checkout process (to be created)

## 🔧 Configuration

Edit `playwright.config.js` or set environment variables:

```bash
export FRONTEND_URL=http://localhost:3000
export TEST_BRANCH_ID=your-branch-uuid
```

## 📊 Test Structure

```javascript
test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## 🚀 CI/CD Integration

Playwright tests can run in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: |
    cd testing
    npm run test:e2e
```

## 📸 Screenshots and Videos

- Screenshots are automatically saved on test failure
- Videos are recorded for failed tests (if configured)
- View reports: `npx playwright show-report`

## 🔍 Debugging

### Debug mode
```bash
npx playwright test --debug
```

### Trace viewer
```bash
npx playwright show-trace trace.zip
```

### Slow down execution
```bash
npx playwright test --slow-mo=1000
```

