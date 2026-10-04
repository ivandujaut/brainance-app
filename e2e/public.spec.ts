import { expect, test } from "@playwright/test";

// Spec 008: the landing and the legal pages are public, in Spanish, and need no session, so this
// runs without Clerk keys.

test("the landing explains BrAInance in Spanish, without paid plans or blog", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Tu negocio responde a las 3 de la mañana.");
  await expect(page.getByRole("heading", { name: /Tres pasos, una tarde/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Crear mi bot gratis/ }).first()).toHaveAttribute("href", "/auth/sign-up");
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

// Spec 009: the hero shows the real widget playing a scripted conversation that ends in a lead or an alert.
test("the landing demo plays a conversation in the real widget", async ({ page }) => {
  await page.goto("/");
  const demo = page.getByRole("tablist", { name: "Elegí un negocio de ejemplo" });
  await expect(demo.getByRole("tab", { name: "Panadería" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("¿Tienen algo sin TACC?")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("demo-outcome")).toContainText("Nuevo contacto", { timeout: 20_000 });

  await demo.getByRole("tab", { name: "Taller" }).click();
  await expect(page.getByText(/freno de adelante/)).toBeVisible({ timeout: 10_000 });
});

test("with reduced motion the demo shows the whole conversation at once", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText(/Se encargan hasta el miércoles/)).toBeVisible();
  await expect(page.getByTestId("demo-outcome")).toBeVisible();
  await context.close();
});

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
