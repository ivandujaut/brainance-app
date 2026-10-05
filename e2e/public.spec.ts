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

// Spec 009: the hero shows screenshots of the real dashboard and inbox; the inbox one is described.
test("the landing hero shows the real inbox", async ({ page }) => {
  await page.goto("/");
  const shot = page.getByRole("img", { name: /La bandeja de BrAInance/ });
  await expect(shot).toBeVisible();
  await expect.poll(() => shot.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});

// Spec 009: the problem block shows everyday questions with the bot's answer, in parallax columns.
test("the question wall shows real questions with the bot's answers", async ({ page }) => {
  await page.goto("/");
  const block = page.getByTestId("question-wall");
  await expect(block.getByRole("heading", { name: /quiere la respuesta ahora/ })).toBeVisible();
  const cards = block.getByRole("list", { name: "Preguntas respondidas por el bot" }).getByRole("listitem");
  expect(await cards.count()).toBeGreaterThanOrEqual(12);
  await expect(cards.first()).toContainText("¿");
});

test("the question columns move in opposite directions while the page scrolls", async ({ page }) => {
  await page.goto("/");
  const columns = page.getByTestId("parallax-column");
  const offsets = () =>
    Promise.all([0, 1].map((i) => columns.nth(i).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42)));
  await page.getByTestId("question-wall").scrollIntoViewIfNeeded();
  const [firstBefore, secondBefore] = await offsets();
  await page.mouse.wheel(0, 400);
  await expect.poll(async () => (await offsets())[0]).toBeLessThan(firstBefore);
  expect((await offsets())[1]).toBeGreaterThan(secondBefore);
});

test("with reduced motion the question columns stay still", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByTestId("question-wall").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  for (const column of await page.getByTestId("parallax-column").all()) {
    expect(await column.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  }
  await context.close();
});

// Light theme only for now: no theme picker, and a dark preference saved earlier is ignored.
test("the landing stays light even with a saved dark preference", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: /tema|theme/i })).toHaveCount(0);
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
