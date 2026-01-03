// E2E Test: Admin Flow
// Tests the admin portal functionality

import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login (if exists)
    await page.goto('/admin/login');
    
    // Login (adjust selectors based on actual login form)
    // await page.fill('input[name="email"]', 'admin@restaurant.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
    
    // For now, skip login and go directly to dashboard
    await page.goto('/');
  });

  test('should display dashboard', async ({ page }) => {
    // Check if dashboard loads
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
    
    // Check for key metrics
    await expect(page.locator('text=/Total Revenue|Revenue/i')).toBeVisible();
    await expect(page.locator('text=/Orders|Total Orders/i')).toBeVisible();
  });

  test('should navigate to kitchen display', async ({ page }) => {
    // Click kitchen menu item
    await page.click('text=/Kitchen|Kitchen Display/i');
    
    // Verify kitchen page
    await expect(page).toHaveURL(/.*\/kitchen|\/orders\/kitchen/);
    await expect(page.locator('h1:has-text("Kitchen")')).toBeVisible();
  });

  test('should view orders list', async ({ page }) => {
    // Navigate to orders
    await page.click('text=/Orders/i');
    
    // Verify orders page
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.locator('h1:has-text("Orders")')).toBeVisible();
  });

  test('should update order status in kitchen', async ({ page }) => {
    // Navigate to kitchen
    await page.goto('/orders/kitchen');
    
    // Wait for orders to load
    await page.waitForSelector('[data-testid="order-card"]', { timeout: 10000 });
    
    // Click start cooking on first item
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    await firstOrder.locator('button:has-text("Bắt đầu nấu")').first().click();
    
    // Verify status updated
    await expect(firstOrder.locator('text=/Đang nấu|Cooking/i')).toBeVisible();
  });

  test('should view analytics', async ({ page }) => {
    // Navigate to analytics
    await page.click('text=/Analytics/i');
    
    // Verify analytics page
    await expect(page).toHaveURL(/.*\/analytics/);
    await expect(page.locator('h1:has-text("Analytics")')).toBeVisible();
  });
});

