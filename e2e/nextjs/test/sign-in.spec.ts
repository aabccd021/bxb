/* eslint-disable functional/no-expression-statement */
import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/__masmott__/signIn?redirectUrl=http%3A%2F%2Flocalhost%3A3000%2F');

  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill('aab');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/');
});
