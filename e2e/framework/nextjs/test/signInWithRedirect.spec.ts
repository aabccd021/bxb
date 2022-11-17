/* eslint-disable functional/no-expression-statement */
import { expect, test } from '@playwright/test';

test('user is not signed in initially', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#auth-status')).toHaveText('not signed in');
});

test('user go to redirected url after pressing sign in button', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(
    '/__masmott__/signInWithRedirect?redirectUrl=http%3A%2F%2Flocalhost%3A3000%2F'
  );
});

test('user go back to original url after sign in with redirect', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByLabel('Email').fill('aab');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL('/');
});

test('user state is signed in after sign in', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByLabel('Email').fill('masumoto');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.locator('#auth-status')).toHaveText('email : masumoto');
});

test('user state is signed in after sign in and reload', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByLabel('Email').fill('masumoto');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.reload();
  await expect(page.locator('#auth-status')).toHaveText('email : masumoto');
});

test('user stats is signed out after sign out', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByLabel('Email').fill('kira');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.locator('#auth-status')).toHaveText('not signed in');
});

test('user stats is signed out after sign out and reload', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.getByLabel('Email').fill('kira');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: 'Sign Out' }).click();
  await page.reload();
  await expect(page.locator('#auth-status')).toHaveText('not signed in');
});
