// E2E Test: Order Flow
// Tests the complete customer ordering flow

import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to menu page with table ID
    await page.goto('/customer/menu?table_id=table-001&branch_id=branch-001');
  });

  test('should display menu items', async ({ page }) => {
    // Wait for menu to load
    await page.waitForSelector('[data-testid="product-list"]', { timeout: 10000 });
    
    // Check if products are displayed
    const products = await page.locator('[data-testid="product-item"]').count();
    expect(products).toBeGreaterThan(0);
  });

  test('should add item to cart', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-item"]', { timeout: 10000 });
    
    // Click add to cart on first product
    const firstProduct = page.locator('[data-testid="product-item"]').first();
    await firstProduct.locator('button:has-text("Thêm")').click();
    
    // Check if cart bar appears
    await expect(page.locator('[data-testid="cart-bar"]')).toBeVisible();
    
    // Verify item count
    const itemCount = await page.locator('[data-testid="cart-item-count"]').textContent();
    expect(itemCount).toContain('1');
  });

  test('should update quantity in cart', async ({ page }) => {
    // Add item to cart
    await page.waitForSelector('[data-testid="product-item"]', { timeout: 10000 });
    await page.locator('[data-testid="product-item"]').first().locator('button:has-text("Thêm")').click();
    
    // Increase quantity
    await page.locator('button:has-text("+")').click();
    
    // Verify quantity is 2
    const quantity = await page.locator('[data-testid="quantity"]').textContent();
    expect(quantity).toBe('2');
  });

  test('should navigate to cart page', async ({ page }) => {
    // Add item to cart
    await page.waitForSelector('[data-testid="product-item"]', { timeout: 10000 });
    await page.locator('[data-testid="product-item"]').first().locator('button:has-text("Thêm")').click();
    
    // Click view cart
    await page.locator('button:has-text("Xem giỏ hàng")').click();
    
    // Verify cart page
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator('h1:has-text("Giỏ hàng")')).toBeVisible();
  });

  test('should place order successfully', async ({ page }) => {
    // Add items to cart
    await page.waitForSelector('[data-testid="product-item"]', { timeout: 10000 });
    await page.locator('[data-testid="product-item"]').first().locator('button:has-text("Thêm")').click();
    
    // Go to cart
    await page.locator('button:has-text("Xem giỏ hàng")').click();
    
    // Place order
    await page.locator('button:has-text("Đặt món")').click();
    
    // Verify order confirmation
    await expect(page.locator('text=/Đặt món thành công|Order placed/i')).toBeVisible({ timeout: 10000 });
  });
});

