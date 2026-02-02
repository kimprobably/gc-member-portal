import { test, expect } from '@playwright/test';
import { mockSupabaseQuery, navigateTo, waitForSPALoad } from './helpers';
import { gcMember } from './fixtures/test-data';

// Login page tests run without pre-existing auth
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('GC Login Page', () => {
  test('login page renders at /login', async ({ page }) => {
    await navigateTo(page, '/login');
    await waitForSPALoad(page);

    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('email input and submit button present', async ({ page }) => {
    await navigateTo(page, '/login');
    await waitForSPALoad(page);

    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /sign in|log in|submit|continue/i });
    await expect(submitBtn).toBeVisible();
  });

  test('invalid email shows error', async ({ page }) => {
    // Mock Supabase to return empty (no matching member)
    await mockSupabaseQuery(page, 'gc_members', []);

    await navigateTo(page, '/login');
    await waitForSPALoad(page);

    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.fill('nonexistent@nowhere.test');

    const submitBtn = page.getByRole('button', { name: /sign in|log in|submit|continue/i });
    await submitBtn.click();

    // Error message should appear
    await expect(page.getByText(/not found|invalid|no account|error|denied/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('successful login redirects to /portal', async ({ page }) => {
    await mockSupabaseQuery(page, 'gc_members', [gcMember]);

    await navigateTo(page, '/login');
    await waitForSPALoad(page);

    await page.getByPlaceholder(/email/i).fill(gcMember.email);
    await page.getByRole('button', { name: /sign in|log in|submit|continue/i }).click();

    await page.waitForURL('**/portal', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/portal/);
  });
});
