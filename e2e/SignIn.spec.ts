/* eslint-disable functional/no-expression-statement */
import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/e2e/SignIn');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/public/SignIn');

  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill('aab');

  await page.getByRole('button', { name: 'Sign in with Provider' }).click();
  await expect(page).toHaveURL('/public/SignIn?');
});
