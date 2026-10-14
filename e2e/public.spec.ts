import { expect, test } from "@playwright/test";

// Spec 008: the landing and the legal pages are public, in Spanish, and need no session, so this
// runs without Clerk keys.

test("the landing explains BrAInance in Spanish, without paid plans or blog", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ningún cliente sin respuesta.");
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

// Spec 009 and 013: the problem in the owner's words, with everyday questions the bot answered or
// passed on, in parallax columns.
test("the question wall shows real questions, answered or passed on to the owner", async ({ page }) => {
  await page.goto("/");
  const block = page.getByTestId("question-wall");
  await expect(block.getByRole("heading", { name: /si no contesto, se van a otro/ })).toBeVisible();
  const cards = block.getByRole("list", { name: "Preguntas que el bot respondió o te pasó" }).getByRole("listitem");
  expect(await cards.count()).toBeGreaterThanOrEqual(12);
  await expect(cards.first()).toContainText("¿");
  await expect(cards.filter({ hasText: "Te la pasó a vos" }).first()).toBeAttached();
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
  for (const text of ["el dueño del sitio es el responsable", "BrAInance actúa como encargado", "Neon", "Clerk", "Resend", "Sentry", "Anthropic", "almacenamiento de los íconos", "AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA"]) {
    await expect(policy).toContainText(text);
  }
});

// Spec 009: the footer groups the links by topic and closes with the brand name, big and decorative.
test("the footer groups the links and points to the landing sections", async ({ page }) => {
  await page.goto("/terminos");
  const footer = page.getByRole("contentinfo");
  for (const group of ["Producto", "Cuenta", "Legal"]) {
    await expect(footer.getByRole("navigation", { name: group })).toBeVisible();
  }
  await expect(footer.getByRole("link", { name: "Cómo funciona" })).toHaveAttribute("href", "/#como-funciona");
  await expect(footer.getByRole("link", { name: "Cómo lo medimos" })).toHaveAttribute("href", "/como-medimos");
  await expect(footer.getByRole("link", { name: "La beta y el precio" })).toHaveAttribute("href", "/#beta");
  await expect(footer.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/auth/sign-up");
  await footer.getByRole("link", { name: "Cómo funciona" }).click();
  await expect(page.locator("#como-funciona")).toBeInViewport();
});

test("the landing footer links to both legal pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacidad" }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
  await page.getByRole("contentinfo").getByRole("link", { name: "Términos" }).click();
  await expect(page).toHaveURL(/\/terminos$/);
});

// Spec 013, criteria 1, 2 and 9: the promise first, the titles without the technology, and the
// sections in the order of docs/posicionamiento.md.
test("the landing tells the promise, the problem, the proofs and what happens after the beta", async ({ page }) => {
  await page.goto("/");
  for (const heading of await page.locator("h1, h2").all()) {
    await expect(heading).not.toHaveText(/\bIA\b|inteligente|automatiz|24\/7|3 de la mañana/i);
  }
  const tops = await Promise.all(
    ["promesa", "problema", "pruebas", "como-funciona", "beta", "empezar"].map((id) =>
      page.locator(`#${id}`).evaluate((el) => el.getBoundingClientRect().top + window.scrollY),
    ),
  );
  expect([...tops].sort((a, b) => a - b)).toEqual(tops);

  await page.goto("/#beta");
  const beta = page.locator("section", { has: page.locator("#beta") });
  await expect(page.locator("#beta")).toBeInViewport();
  // QA: the kicker above the title stays in view too.
  await expect(beta.getByText("El precio", { exact: true })).toBeInViewport();
  await expect(beta).toContainText("30 días");
  await expect(beta).toContainText("no se cobra nada automáticamente");
  await expect(beta.getByRole("link", { name: "términos" })).toHaveAttribute("href", "/terminos");
});

// Spec 013, criteria 11 and 12: how the eval works is public, without a session.
test("/como-medimos explains the method and its limits without a session", async ({ page }) => {
  const response = await page.goto("/como-medimos");
  expect(response?.status()).toBe(200);
  const article = page.getByTestId("how-we-measure");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cómo medimos si el bot inventa");
  await expect(article).toContainText(/\d+ consultas/);
  await expect(article).toContainText("el juez también es una IA");
  await page.goto("/");
  await page.getByRole("link", { name: "Cómo lo medimos" }).first().click();
  await expect(page).toHaveURL(/\/como-medimos$/);
});
