/* eslint-disable functional/no-expression-statement */
import { expect, test } from '@playwright/test';

test('homepage has Playwright in title and get started link linking to the intro page', async ({
  page,
}) => {
  await page.goto('/e2e/SignIn');

  await expect(page).toHaveTitle('Sign In');
});
