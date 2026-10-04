import { expect, test } from "@playwright/test";

// Spec 008: the landing and the legal pages are public, in Spanish, and need no session, so this
// runs without Clerk keys.

test("the landing explains BrAInance in Spanish, without paid plans or blog", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Un chat con IA");
  await expect(page.getByRole("heading", { name: "Cómo funciona" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Crear mi bot gratis" })).toHaveAttribute("href", "/auth/sign-up");
  await expect(page.getByText(/Choose what fits|News Room|Unlimited|Free Trial/)).toHaveCount(0);
});
for (const [path, title] of [
  ["/terminos", "Términos de uso"],
  ["/privacidad", "Política de privacidad"],
] as const) {
  test(`${path} is public and versioned`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText(/^Versión \d{4}-\d{2}-\d{2}/)).toBeVisible();
    // Until a lawyer reviews them (LEGAL_REVIEWED=true) the pages say they are a draft.
    await expect(page.getByRole("note")).toContainText("Borrador sujeto a revisión legal");
  });
}

test("the privacy policy names the roles, the providers and the AAIP", async ({ page }) => {
  await page.goto("/privacidad");
  const policy = page.getByTestId("legal-privacidad");
  for (const text of ["el dueño del sitio es el responsable", "BrAInance actúa como encargado", "Neon", "Clerk", "Resend", "Sentry", "Anthropic", "Uploadcare", "AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA"]) {
    await expect(policy).toContainText(text);
  }
});

test("the landing footer links to both legal pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Privacidad" }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
  await page.getByRole("link", { name: "Términos" }).click();
  await expect(page).toHaveURL(/\/terminos$/);
});
