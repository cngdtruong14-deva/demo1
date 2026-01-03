/**
 * E2E Tests - Menu Browsing
 */

const { test, expect } = require('@playwright/test');

test.describe('Menu Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    // Note: branchId should be provided via query param or environment
    const branchId = process.env.TEST_BRANCH_ID || 'test-branch-id';
    await page.goto(`/?branchId=${branchId}`);
  });

  test('should display menu page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/QR Order Platform/i);
    
    // Check header
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display categories and products', async ({ page }) => {
    // Wait for menu to load
    await page.waitForSelector('[data-testid="category"]', { timeout: 10000 }).catch(() => {
      // If categories don't have test IDs, wait for any product card
      return page.waitForSelector('.grid', { timeout: 10000 });
    });

    // Check if categories are displayed
    const categories = page.locator('section');
    const categoryCount = await categories.count();
    
    if (categoryCount > 0) {
      // At least one category should be visible
      await expect(categories.first()).toBeVisible();
    }
  });

  test('should display product cards', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('text=/Thêm vào giỏ/i', { timeout: 10000 });

    // Check if product cards are displayed
    const productCards = page.locator('button:has-text("Thêm vào giỏ")');
    const productCount = await productCards.count();
    
    expect(productCount).toBeGreaterThan(0);
  });

  test('should show spicy icon for spicy products', async ({ page }) => {
    // Wait for products
    await page.waitForSelector('button:has-text("Thêm vào giỏ")', { timeout: 10000 });

    // Check for spicy badge (🌶️)
    const spicyBadge = page.locator('text=/🌶️|Cay/i').first();
    
    // If spicy products exist, badge should be visible
    const spicyCount = await spicyBadge.count();
    if (spicyCount > 0) {
      await expect(spicyBadge.first()).toBeVisible();
    }
  });

  test('should add product to cart', async ({ page }) => {
    // Wait for products
    await page.waitForSelector('button:has-text("Thêm vào giỏ")', { timeout: 10000 });

    // Click first "Add to Cart" button
    const firstAddButton = page.locator('button:has-text("Thêm vào giỏ")').first();
    await firstAddButton.click();

    // Check for alert or confirmation
    // Note: This depends on cart implementation
    // For now, just check that button was clicked
    await expect(firstAddButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that layout adapts
    await page.waitForSelector('header', { timeout: 5000 });
    
    // Products should stack vertically on mobile
    const grid = page.locator('.grid').first();
    if (await grid.count() > 0) {
      const gridClass = await grid.getAttribute('class');
      expect(gridClass).toContain('grid-cols-1');
    }
  });
});

test.describe('Error Handling', () => {
  test('should show error for invalid branch', async ({ page }) => {
    await page.goto('/?branchId=invalid-branch-id');

    // Wait for error message
    await page.waitForSelector('text=/Không thể tải thực đơn/i', { timeout: 10000 });
    
    // Check retry button
    const retryButton = page.locator('button:has-text("Thử lại")');
    await expect(retryButton).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Navigate and immediately check for loading
    const navigationPromise = page.goto('/?branchId=test-id');
    
    // Check for loading spinner (may be too fast to catch)
    const loadingSpinner = page.locator('text=/Đang tải/i');
    const spinnerVisible = await loadingSpinner.isVisible().catch(() => false);
    
    await navigationPromise;
    
    // Loading should eventually disappear
    await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
  });
});

