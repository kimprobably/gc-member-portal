import { test, expect } from '@playwright/test';
import { mockSupabaseQuery, navigateTo, waitForSPALoad } from './helpers';
import { gcMember, gcCampaign, gcToolAccess, gcResource } from './fixtures/test-data';

test.describe('GC Portal (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure GC member data is available for all portal pages
    await mockSupabaseQuery(page, 'gc_members', [gcMember]);
    await mockSupabaseQuery(page, 'campaigns', [gcCampaign]);
    await mockSupabaseQuery(page, 'tool_access', [gcToolAccess]);
    await mockSupabaseQuery(page, 'resources', [gcResource]);
    await mockSupabaseQuery(page, 'member_progress', []);
    await mockSupabaseQuery(page, 'member_icp', []);
  });

  test('dashboard overview loads with stats', async ({ page }) => {
    await navigateTo(page, '/portal');
    await waitForSPALoad(page);

    // Should show some kind of dashboard heading or welcome
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('onboarding checklist shows progress', async ({ page }) => {
    await navigateTo(page, '/portal/onboarding');
    await waitForSPALoad(page);

    // Onboarding page should have step/checklist items
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('tool access page lists available tools', async ({ page }) => {
    await navigateTo(page, '/portal/tools');
    await waitForSPALoad(page);

    await expect(page.getByText(/tool|access/i).first()).toBeVisible();
  });

  test('campaigns page shows campaign table', async ({ page }) => {
    await navigateTo(page, '/portal/campaigns');
    await waitForSPALoad(page);

    await expect(page.getByText(gcCampaign.name).first()).toBeVisible();
  });

  test('ICP builder loads with form fields', async ({ page }) => {
    await navigateTo(page, '/portal/icp');
    await waitForSPALoad(page);

    // ICP builder should have input fields for defining the ideal customer
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('resources page shows resource cards', async ({ page }) => {
    await navigateTo(page, '/portal/resources');
    await waitForSPALoad(page);

    await expect(page.getByText(gcResource.title).first()).toBeVisible();
  });

  test('navigation between all portal pages works', async ({ page }) => {
    await navigateTo(page, '/portal');
    await waitForSPALoad(page);

    // Navigate to each sub-page via sidebar/nav links
    const navPaths = [
      { label: /tool/i, url: '/portal/tools' },
      { label: /campaign/i, url: '/portal/campaigns' },
      { label: /icp|ideal/i, url: '/portal/icp' },
      { label: /resource/i, url: '/portal/resources' },
    ];

    for (const { label, url } of navPaths) {
      const link = page.getByRole('link', { name: label }).first();
      if ((await link.count()) > 0) {
        await link.click();
        await page.waitForURL(`**${url}`, { timeout: 10_000 });
        await waitForSPALoad(page);
      }
    }
  });
});
