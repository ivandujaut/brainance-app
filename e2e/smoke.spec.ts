import { expect, test } from "@playwright/test";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

test.describe("smoke", () => {
  test("landing page loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("sign-in page is public", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  for (const path of ["/settings", "/appointment"]) {
    test(`${path} redirects anonymous visitors to sign-in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });
  }
});
