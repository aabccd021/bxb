/* eslint-disable functional/no-expression-statement */
import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/e2e/SignIn');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/public/SignIn?redirectUrl=http%3A%2F%2Flocalhost%3A3000%2Fe2e%2FSignIn');

  await page.getByLabel('Email').click();
  await page.getByLabel('Email').fill('aab');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/e2e/SignIn');
});
