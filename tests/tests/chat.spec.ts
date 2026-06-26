import { test, expect } from '@playwright/test';

const url = process.env.TEST_URL;

const username = process.env.TEST_USERNAME;
const password = process.env.TEST_PASSWORD;

test('login with Logto', async ({ page }) => {
  await page.goto(url);
  await expect(page).toHaveTitle(/Sign in/);

  // Fill in username/identifier
  await page.locator('input[name="identifier"]').fill(username);

  // Fill in password
  await page.locator('input[name="password"]').fill(password);

  // Submit the form
  await page.locator('button[type="submit"]').click();

  // Wait for successful login and redirect back to app
  await expect(page).toHaveURL(url);
});

test('send a message and verify it is displayed', async ({ page }) => {
  await page.goto(url);

  // Login first
  await page.locator('input[name="identifier"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect and page to load
  await expect(page).toHaveURL(url);

  // Wait for messages to load (loading spinner to disappear)
  await page
    .locator('[data-test="messages-loading"]')
    .waitFor({ state: 'hidden', timeout: 10000 })
    .catch(() => {});

  // Generate a unique message to avoid collision with existing messages
  const testMessage = `Test message ${Date.now()}`;

  // Find the textarea and type the message
  await page.locator('[data-test="message-input"]').fill(testMessage);
  await page.locator('[data-test="message-input"]').press('Enter');

  await page.screenshot({ path: 'test-results/message-sent.png', fullPage: true });

  // Wait for the message to appear in the messages list
  await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });
});
