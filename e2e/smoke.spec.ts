import { expect, test } from "@playwright/test";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

test.describe("smoke", () => {
  test("sign-in page is public", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  for (const path of ["/settings", "/conversations", "/leads"]) {
    test(`${path} redirects anonymous visitors to sign-in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/auth\/sign-in/);
    });
  }

  // The Sentry test route sends events on our quota: only signed-in users may trigger it. The E2E server
  // runs as a preview (playwright.config.ts), so the route exists and only the sign-in can block it.
  test("the Sentry test route is not open to anonymous visitors", async ({ request }) => {
    const response = await request.get("/api/debug/sentry", { maxRedirects: 0 });
    expect(response.status()).not.toBe(200);
  });
});
