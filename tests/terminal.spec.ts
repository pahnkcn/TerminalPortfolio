import { expect, test } from '@playwright/test';

test.describe('Terminal CLI', () => {
  test('shows help output', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');

    await expect(input).toBeEnabled();
    await input.fill('help');
    await input.press('Enter');

    await expect(page.getByText('Show this help message', { exact: false })).toBeVisible();
  });

  test('shows project details', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');

    await expect(input).toBeEnabled();
    await input.fill('project auto-scaler-cloud');
    await input.press('Enter');

    await expect(page.getByText('Auto-Scaling Cloud Infrastructure')).toBeVisible();
  });

  test('supports command history navigation', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');

    await expect(input).toBeEnabled();
    await input.fill('skills');
    await input.press('Enter');
    await input.fill('contact');
    await input.press('Enter');

    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveValue('contact');

    await page.keyboard.press('ArrowUp');
    await expect(input).toHaveValue('skills');
  });

  test('autocompletes unique commands', async ({ page }) => {
    await page.goto('/');
    const input = page.getByLabel('Terminal input');

    await expect(input).toBeEnabled();
    await input.fill('resu');
    await page.keyboard.press('Tab');

    await expect(input).toHaveValue('resume');
  });
});
