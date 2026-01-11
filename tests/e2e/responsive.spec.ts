import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('login page renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/');

    // Login form should be visible
    await expect(page.getByPlaceholder(/you@company\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();

    // Form should be visible and reasonably sized on mobile
    const form = page.locator('form');
    await expect(form).toBeVisible();
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBeGreaterThan(200);
  });

  test('bootcamp login page renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/bootcamp');

    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('login page renders correctly on tablet', async ({ page }) => {
    // Use iPad (gen 7) which is the correct device name in Playwright
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByPlaceholder(/you@company\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('login page renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.getByPlaceholder(/you@company\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });
});

test.describe('Dark Mode', () => {
  test('supports dark mode toggle', async ({ page }) => {
    await page.goto('/');

    // Just verify the page loads in both modes without crashing
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Growth Collective' })).toBeVisible();

    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Growth Collective' })).toBeVisible();
  });
});
