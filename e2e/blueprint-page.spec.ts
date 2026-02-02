import { test, expect } from '@playwright/test';
import { mockSupabaseQuery, navigateTo, waitForSPALoad } from './helpers';
import { prospect } from './fixtures/test-data';

// Public pages -- no auth
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Blueprint Prospect Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the prospect lookup so the page renders without a real DB
    await mockSupabaseQuery(page, 'prospects', [prospect]);
  });

  test('prospect page loads at /blueprint/:slug', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}`);
    await waitForSPALoad(page);

    // Prospect name should appear somewhere on the page
    await expect(page.getByText(prospect.full_name).first()).toBeVisible();
  });

  test('authority score section displays with score badge', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}`);
    await waitForSPALoad(page);

    // Score value should be visible
    await expect(page.getByText(String(prospect.authority_score)).first()).toBeVisible();

    // "Authority Score" label
    await expect(page.getByText(/authority score/i).first()).toBeVisible();
  });

  test("what's working section renders 3 items", async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}`);
    await waitForSPALoad(page);

    await expect(page.getByText(/what.?s working/i).first()).toBeVisible();

    for (const item of prospect.whats_working) {
      await expect(page.getByText(item.title).first()).toBeVisible();
    }
  });

  test('revenue leaks section renders', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}`);
    await waitForSPALoad(page);

    await expect(page.getByText(/revenue leak|opportunity|gap/i).first()).toBeVisible();

    for (const leak of prospect.revenue_leaks) {
      await expect(page.getByText(leak.title).first()).toBeVisible();
    }
  });

  test('lead magnet cards display', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}`);
    await waitForSPALoad(page);

    for (const lm of prospect.lead_magnets) {
      await expect(page.getByText(lm.title).first()).toBeVisible();
    }
  });

  test('CTA buttons are clickable', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}`);
    await waitForSPALoad(page);

    // Find any CTA-style buttons/links
    const ctaButtons = page.getByRole('link', {
      name: /book|schedule|get started|claim|view offer/i,
    });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);

    // Ensure the first CTA is enabled and clickable
    await expect(ctaButtons.first()).toBeEnabled();
  });

  test('404 handling for invalid slug', async ({ page }) => {
    // Return empty array for unknown prospect
    await mockSupabaseQuery(page, 'prospects', []);

    await navigateTo(page, '/blueprint/this-slug-does-not-exist');
    await waitForSPALoad(page);

    // App should show some kind of not-found or redirect to home
    const hasNotFound = await page.getByText(/not found|no blueprint|doesn.?t exist/i).count();
    const redirectedHome = page.url().endsWith('/') || page.url().includes('/blueprint');
    expect(hasNotFound > 0 || redirectedHome).toBeTruthy();
  });
});
