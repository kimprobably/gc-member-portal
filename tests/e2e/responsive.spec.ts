import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('login page renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/');

    // Login form should be visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /access portal/i })).toBeVisible();

    // Form should be full width on mobile
    const form = page.locator('form');
    const formBox = await form.boundingBox();
    const viewportWidth = devices['iPhone 12'].viewport.width;

    // Form should use most of the viewport width
    expect(formBox?.width).toBeGreaterThan(viewportWidth * 0.8);
  });

  test('bootcamp login page renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/bootcamp');

    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('login page renders correctly on tablet', async ({ page }) => {
    await page.setViewportSize(devices['iPad'].viewport);
    await page.goto('/');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /access portal/i })).toBeVisible();
  });

  test('login page renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /access portal/i })).toBeVisible();
  });
});

test.describe('Dark Mode', () => {
  test('respects system color scheme preference (dark)', async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    // Page should have dark mode styles applied
    // Check for dark background or dark mode class
    const body = page.locator('body');
    const hasDarkMode = await body.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      // Dark backgrounds typically have low RGB values
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const avg = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
        return avg < 128; // Darker than mid-gray
      }
      return el.classList.contains('dark');
    });

    expect(hasDarkMode).toBe(true);
  });

  test('respects system color scheme preference (light)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const body = page.locator('body');
    const hasLightMode = await body.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const bgColor = style.backgroundColor;
      const rgb = bgColor.match(/\d+/g);
      if (rgb) {
        const avg = (parseInt(rgb[0]) + parseInt(rgb[1]) + parseInt(rgb[2])) / 3;
        return avg > 128; // Lighter than mid-gray
      }
      return !el.classList.contains('dark');
    });

    expect(hasLightMode).toBe(true);
  });
});
