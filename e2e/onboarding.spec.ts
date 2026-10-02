import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUsers } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 002, criteria 6–12: the whole checklist, from a new account to an installed bot.
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

test("guides a new account from adding a site to installing the bot", async ({ page, baseURL }) => {
  const email = await createTestUser("onboarding");
  created.push(email);
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: email });
  await page.goto("/dashboard");

  const checklist = page.getByTestId("onboarding-checklist");
  const step = (id: string) => checklist.getByTestId(`step-${id}`);
  await expect(step("add-site")).toHaveAttribute("data-done", "false");

  // Step 1: invalid domains are rejected in Spanish; a valid one creates the site.
  const domainInput = step("add-site").locator('input[name="domain"]');
  await domainInput.fill("http://minegocio.com.ar");
  await step("add-site").getByRole("button", { name: "Agregar sitio" }).click();
  await expect(step("add-site").getByText(/Ingresá solo el dominio/)).toBeVisible();

  const domain = `e2e-${Date.now()}.com.ar`;
  await domainInput.fill(domain);
  await step("add-site").getByRole("button", { name: "Agregar sitio" }).click();
  await expect(step("add-site")).toHaveAttribute("data-done", "true");

  // Step 3 can be done before step 2 (steps can be skipped).
  const snippet = step("install").getByTestId("install-snippet");
  await expect(snippet).toContainText(`${new URL(baseURL!).origin}/widget.js`);
  await expect(snippet).toContainText("data-domain-id=");

  // Step 2: three FAQs from the bot settings page.
  await step("train-bot").getByRole("link", { name: "Cargar preguntas frecuentes" }).click();
  await page.getByRole("tab", { name: /help desk/i }).click();
  for (const n of [1, 2, 3]) {
    await page.locator('input[name="question"]').fill(`¿Pregunta ${n}?`);
    await page.locator('textarea[name="answer"]').fill(`Respuesta ${n}.`);
    await page.getByRole("button", { name: "Create" }).click();
    await expect(page.getByText(`¿Pregunta ${n}?`)).toBeVisible();
  }

  // Progress is derived from data, so it survives navigation.
  await page.goto("/dashboard");
  await expect(step("train-bot")).toHaveAttribute("data-done", "true");
  await expect(step("install")).toHaveAttribute("data-done", "false");

  await step("install").getByRole("button", { name: "Ya lo instalé" }).click();
  await expect(page.getByTestId("onboarding-checklist")).toBeHidden();
  await expect(page.getByTestId("dashboard-ready")).toBeVisible();
});
