/* eslint-disable functional/no-expression-statement */
import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/e2e/SignIn?');

  await page.getByLabel('Email').click();

  await page.getByLabel('Email').fill('a');

  await page.getByLabel('Display name').click();

  await page.getByLabel('Display name').fill('a');

  await page.getByLabel('Profile photo URL').click();

  await page.getByLabel('Profile photo URL').fill('b');

  await page.getByRole('button', { name: 'Sign in with Provider' }).click();

  await expect(page).toHaveURL('http://localhost:3000/e2e/SignIn?');
});
