import { expect, test } from "@playwright/test";

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
