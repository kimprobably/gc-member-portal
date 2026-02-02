import { test, expect } from '@playwright/test';
import { navigateTo, waitForSPALoad } from './helpers';

// Blueprint landing pages are fully public -- no auth required.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Blueprint Landing Page', () => {
  test('loads at /blueprint with headline and opt-in form', async ({ page }) => {
    await navigateTo(page, '/blueprint');

    // Expect a prominent headline
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();

    // Expect an email opt-in form
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toBeVisible();

    // Expect a submit / CTA button
    const submitBtn = page.getByRole('button', { name: /get|start|submit|see|view|free/i });
    await expect(submitBtn).toBeVisible();
  });

  test('form submission with valid email redirects to /blueprint/thank-you', async ({ page }) => {
    await navigateTo(page, '/blueprint');

    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.fill('test-user@example.com');

    const submitBtn = page.getByRole('button', { name: /get|start|submit|see|view|free/i });
    await submitBtn.click();

    await page.waitForURL('**/blueprint/thank-you', { timeout: 15_000 });
    await expect(page).toHaveURL(/\/blueprint\/thank-you/);
  });

  test('empty email shows validation error', async ({ page }) => {
    await navigateTo(page, '/blueprint');

    // Click submit without filling email
    const submitBtn = page.getByRole('button', { name: /get|start|submit|see|view|free/i });
    await submitBtn.click();

    // Should stay on the same page -- form validation prevents navigation
    await expect(page).toHaveURL(/\/blueprint$/);

    // Native HTML5 validation or custom error text
    const emailInput = page.getByPlaceholder(/email/i);
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('thank-you page renders with confirmation', async ({ page }) => {
    await navigateTo(page, '/blueprint/thank-you');

    await waitForSPALoad(page);
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
    await expect(page.getByText(/thank|confirm|check your|success/i).first()).toBeVisible();
  });
});
