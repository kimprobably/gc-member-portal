import { test, expect } from '@playwright/test';

test.describe('GC Member Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the GC portal
    await page.goto('/');
  });

  test('displays login page for unauthenticated users', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /member portal/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /access portal/i })).toBeVisible();
  });

  test('shows error for invalid email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByRole('button', { name: /access portal/i }).click();

    await expect(page.getByText(/not found|not authorized/i)).toBeVisible({ timeout: 10000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    // Use a valid test email from environment variable
    const testEmail = process.env.VITE_TEST_GC_EMAIL;
    if (!testEmail) {
      test.skip();
      return;
    }

    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole('button', { name: /access portal/i }).click();

    // Should redirect to dashboard
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible({ timeout: 15000 });
  });

  test('login page is responsive', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, login should still be visible
      await expect(page.getByRole('button', { name: /access portal/i })).toBeVisible();
    }
  });
});

test.describe('GC Portal Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // For navigation tests, we need to be logged in
    // This would require a valid test account
    const testEmail = process.env.VITE_TEST_GC_EMAIL;
    if (!testEmail) {
      test.skip();
      return;
    }

    await page.goto('/');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByRole('button', { name: /access portal/i }).click();
    await page.waitForURL('**/'); // Wait for redirect
  });

  test('sidebar navigation works', async ({ page }) => {
    const testEmail = process.env.VITE_TEST_GC_EMAIL;
    if (!testEmail) {
      test.skip();
      return;
    }

    // Wait for dashboard to load
    await expect(page.getByText(/dashboard|home/i)).toBeVisible({ timeout: 15000 });

    // Navigate to onboarding
    await page.getByRole('link', { name: /onboarding/i }).click();
    await expect(page).toHaveURL(/onboarding/);

    // Navigate to tools
    await page.getByRole('link', { name: /tools/i }).click();
    await expect(page).toHaveURL(/tools/);

    // Navigate to campaigns
    await page.getByRole('link', { name: /campaigns/i }).click();
    await expect(page).toHaveURL(/campaigns/);

    // Navigate to ICP
    await page.getByRole('link', { name: /icp|positioning/i }).click();
    await expect(page).toHaveURL(/icp/);

    // Navigate to resources
    await page.getByRole('link', { name: /resources/i }).click();
    await expect(page).toHaveURL(/resources/);
  });
});

test.describe('Bootcamp Portal', () => {
  test('bootcamp login page loads', async ({ page }) => {
    await page.goto('/bootcamp');

    await expect(page.getByText(/welcome back|training/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('bootcamp and GC portals are separate', async ({ page }) => {
    // Check GC portal
    await page.goto('/');
    await expect(page.getByText(/member portal|growth collective/i)).toBeVisible();

    // Check Bootcamp portal
    await page.goto('/bootcamp');
    await expect(page.getByText(/training|gtm os/i)).toBeVisible();
  });
});
