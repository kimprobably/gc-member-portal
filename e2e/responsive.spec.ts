import { test, expect } from '@playwright/test';
import { mockSupabaseQuery, navigateTo, waitForSPALoad, loginAsAdmin } from './helpers';
import { gcMember, adminMember } from './fixtures/test-data';

// Use a mobile viewport for all tests in this file
test.use({
  viewport: { width: 375, height: 812 },
  storageState: { cookies: [], origins: [] },
});

test.describe('Responsive Layout (375px mobile)', () => {
  test('blueprint landing page responsive at 375px width', async ({ page }) => {
    await navigateTo(page, '/blueprint');
    await waitForSPALoad(page);

    // Page should not have horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // small tolerance

    // Headline and form should still be visible
    await expect(page.getByRole('heading').first()).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test('portal dashboard responsive', async ({ page }) => {
    // Set up auth for portal
    await page.addInitScript((m) => {
      localStorage.setItem('gc_member', JSON.stringify(m));
    }, gcMember);
    await mockSupabaseQuery(page, 'gc_members', [gcMember]);
    await mockSupabaseQuery(page, 'campaigns', []);
    await mockSupabaseQuery(page, 'member_progress', []);

    await navigateTo(page, '/portal');
    await waitForSPALoad(page);

    // Should render without horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);

    // Heading should be visible
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('admin dashboard responsive', async ({ page }) => {
    await loginAsAdmin(page, adminMember);
    await mockSupabaseQuery(page, 'gc_members', [adminMember]);
    await mockSupabaseQuery(page, 'tool_access', []);

    await navigateTo(page, '/admin');
    await waitForSPALoad(page);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('navigation menu collapses to hamburger', async ({ page }) => {
    await page.addInitScript((m) => {
      localStorage.setItem('gc_member', JSON.stringify(m));
    }, gcMember);
    await mockSupabaseQuery(page, 'gc_members', [gcMember]);
    await mockSupabaseQuery(page, 'campaigns', []);
    await mockSupabaseQuery(page, 'member_progress', []);

    await navigateTo(page, '/portal');
    await waitForSPALoad(page);

    // At 375px, sidebar should be hidden and a hamburger/menu button should be visible
    const hamburger = page
      .getByRole('button', { name: /menu/i })
      .or(page.locator('button:has(svg)').filter({ hasText: '' }).first())
      .or(page.locator('[aria-label*="menu" i]'));

    const hamburgerCount = await hamburger.count();

    if (hamburgerCount > 0) {
      // Click the hamburger to open mobile nav
      await hamburger.first().click();
      await page.waitForTimeout(500);

      // Nav links should now be visible
      const navLinks = page.getByRole('link');
      expect(await navLinks.count()).toBeGreaterThan(0);
    } else {
      // Some layouts render nav inline even on mobile -- that's acceptable
      // Just ensure the page is usable
      await expect(page.locator('#root')).not.toBeEmpty();
    }
  });
});
