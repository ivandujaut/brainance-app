import { setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUsers, signInAs, TEST_PASSWORD, testEmail, VERIFICATION_CODE } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 002, criteria 1–4. Google sign-in is covered by manual QA (OAuth can't run in CI).
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

test("signs up with email and a verification code, in Spanish, and lands on the dashboard", async ({ page }) => {
  const email = testEmail("signup");
  created.push(email);
  await setupClerkTestingToken({ page });

  await page.goto("/auth/sign-up");
  await expect(page.getByRole("heading", { name: "Creá tu cuenta" })).toBeVisible();
  // Spec 008, criterion 7: signing up accepts the terms, linked from the page.
  await expect(page.getByTestId("terms-notice").getByRole("link", { name: "Términos" })).toHaveAttribute("href", "/terminos");
  await page.locator('input[name="emailAddress"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  await expect(page).toHaveURL(/verify-email-address/);
  // Typing before the code field is ready loses digits (flaky in CI): wait for it and focus it.
  const code = page.locator('input[autocomplete="one-time-code"]').first();
  await expect(code).toBeAttached();
  await code.focus();
  await page.keyboard.type(VERIFICATION_CODE, { delay: 100 });

  await expect(page).toHaveURL(/\/dashboard$/);
  // First visit provisions the database user: the onboarding checklist renders instead of an error.
  await expect(page.getByTestId("onboarding-checklist")).toBeVisible();
});

test("signs in with email and password and lands on the dashboard", async ({ page }) => {
  const email = await createTestUser("signin");
  created.push(email);
  await setupClerkTestingToken({ page });

  await page.goto("/auth/sign-in");
  await page.locator('input[name="identifier"]').fill(email);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
});

test("redirects signed-in users away from the auth pages", async ({ page }) => {
  const email = await createTestUser("redirect");
  created.push(email);
  await signInAs(page, email);

  for (const path of ["/auth/sign-in", "/auth/sign-up"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/dashboard$/);
  }
});
