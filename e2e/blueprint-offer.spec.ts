import { test, expect } from '@playwright/test';
import { mockSupabaseQuery, navigateTo, waitForSPALoad } from './helpers';
import { prospect } from './fixtures/test-data';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Blueprint Offer Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseQuery(page, 'prospects', [prospect]);
  });

  test('offer page at /blueprint/:slug/offer renders', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}/offer`);
    await waitForSPALoad(page);

    // Page should contain the prospect name or a generic offer heading
    const hasName = await page.getByText(prospect.first_name).count();
    const hasOffer = await page.getByText(/offer|package|plan|pricing/i).count();
    expect(hasName + hasOffer).toBeGreaterThan(0);
  });

  test('pricing section displays', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}/offer`);
    await waitForSPALoad(page);

    // Look for a price indicator (dollar sign, "price", "investment", etc.)
    await expect(page.getByText(/\$|price|investment|package|month/i).first()).toBeVisible();
  });

  test('booking link / CTA button present', async ({ page }) => {
    await navigateTo(page, `/blueprint/${prospect.slug}/offer`);
    await waitForSPALoad(page);

    const cta = page
      .getByRole('link', { name: /book|schedule|get started|claim|apply/i })
      .or(page.getByRole('button', { name: /book|schedule|get started|claim|apply/i }));
    await expect(cta.first()).toBeVisible();
  });

  test('case studies page at /case-studies loads', async ({ page }) => {
    await navigateTo(page, '/case-studies');
    await waitForSPALoad(page);

    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    await expect(page.getByText(/case stud|success|result|client/i).first()).toBeVisible();
  });
});
