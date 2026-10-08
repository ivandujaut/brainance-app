import { expect, test, type Page } from "@playwright/test";
import { createTestUser, deleteTestUsers, signInAs } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 004: the owner configures the bot from the settings page of their site.
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

const signUpWithSite = async (page: Page) => {
  const email = await createTestUser("bot-settings");
  created.push(email);
  await signInAs(page, email);
  await page.goto("/dashboard");
  const domain = `e2e-${Date.now()}.com.ar`;
  const addSite = page.getByTestId("onboarding-checklist").getByTestId("step-add-site");
  await addSite.locator('input[name="domain"]').fill(domain);
  await addSite.getByRole("button", { name: "Agregar sitio" }).click();
  await expect(addSite).toHaveAttribute("data-done", "true");
  return domain;
};

test("the owner configures business data, appearance and FAQs", async ({ page }) => {
  const domain = await signUpWithSite(page);

  // Criterion 3: the sidebar links to the site's settings by id.
  await page.getByRole("link", { name: domain }).first().click();
  await expect(page).toHaveURL(/\/settings\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { name: domain })).toBeVisible();
  await expect(page.getByText("Premium")).toHaveCount(0);

  // Criteria 5 and 6: business data, with a hint while it is incomplete.
  const business = page.getByTestId("section-negocio");
  await expect(business.getByTestId("business-hint")).toBeVisible();
  await business.getByLabel("A qué se dedica tu negocio").fill("Panadería artesanal en Rosario.");
  await business.getByLabel(/De usted/).check();
  await business.getByLabel("A dónde deriva cuando no sabe algo").fill("WhatsApp +54 9 341 555-0101");
  await business.getByTestId("save-business").click();
  await expect(page.getByText("Datos del negocio guardados").first()).toBeVisible();
  await expect(business.getByTestId("business-hint")).toBeHidden();
  // QA of spec 013: our default welcome followed the switch to "usted".
  await expect(page.getByText("El saludo del chat ahora es de usted").first()).toBeVisible();
  await expect(page.getByTestId("bot-preview").getByText("¡Hola! ¿Tiene alguna consulta? Escríbanos acá.")).toBeVisible();
  await expect(page.getByTestId("welcome-hint")).toHaveCount(0);

  // Criteria 8 and 10: the preview follows the color before saving, with readable text.
  const preview = page.getByTestId("bot-preview").locator("header");
  const appearance = page.getByTestId("section-apariencia");
  await appearance.getByRole("radio", { name: "#FACC15" }).click();
  await expect(preview).toHaveCSS("background-color", "rgb(250, 204, 21)");
  await expect(preview).toHaveCSS("color", "rgb(15, 23, 42)");
  await appearance.getByLabel("Mensaje de bienvenida").fill("¡Buen día! ¿Qué está buscando?");
  await expect(page.getByTestId("bot-preview").getByText("¡Buen día! ¿Qué está buscando?")).toBeVisible();

  // Criterion 11: an invalid color is not saved.
  await appearance.getByTestId("color-hex").fill("amarillo");
  await appearance.getByTestId("save-appearance").click();
  await expect(appearance.getByText("Ingresá un color en formato #RRGGBB.")).toBeVisible();
  await appearance.getByTestId("color-hex").fill("#123456");
  await appearance.getByTestId("save-appearance").click();
  await expect(page.getByText("Apariencia guardada").first()).toBeVisible();

  // Criterion 12: create, edit and delete an FAQ.
  const faqs = page.getByTestId("section-preguntas-frecuentes");
  await faqs.locator("#faq-new-question").fill("¿Hacen envíos?");
  await faqs.locator("#faq-new-answer").fill("Sí.");
  await faqs.getByRole("button", { name: "Agregar" }).click();
  await expect(faqs.getByTestId("faq-item")).toHaveCount(1);

  await faqs.getByRole("button", { name: "Editar “¿Hacen envíos?”" }).click();
  await faqs.getByTestId("faq-item").getByLabel("Respuesta").fill("Sí, a todo el país.");
  await faqs.getByTestId("faq-item").getByRole("button", { name: "Guardar" }).click();
  await expect(faqs.getByText("Sí, a todo el país.")).toBeVisible();

  await faqs.getByRole("button", { name: "Borrar “¿Hacen envíos?”" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
  await expect(faqs.getByTestId("faq-item")).toHaveCount(0);

  // Everything saved survives a reload.
  await page.reload();
  await expect(page.getByLabel("A qué se dedica tu negocio")).toHaveValue("Panadería artesanal en Rosario.");
  await expect(page.getByLabel(/De usted/)).toBeChecked();
  await expect(page.getByTestId("color-hex")).toHaveValue("#123456");
});

test("another tenant's or an unknown site id is not found", async ({ page }) => {
  await signUpWithSite(page);
  const response = await page.goto("/settings/6f1c7f4e-1f3a-4c8e-9a3b-2d1e0f9c8b7a");
  expect(response?.status()).toBe(404);
  expect((await page.goto("/settings/no-es-un-id"))?.status()).toBe(404);
});

// Spec 011, criteria 7, 8 and 12: the owner sees today's usage and sets a lower daily cap.
test("the owner sees today's usage and sets a daily answer cap", async ({ page }) => {
  const domain = await signUpWithSite(page);
  await page.getByRole("link", { name: domain }).first().click();
  await expect(page).toHaveURL(/\/settings\/[0-9a-f-]{36}$/);

  const usage = page.getByTestId("section-uso");
  await expect(usage.getByTestId("usage-today")).toHaveText("Hoy: 0 de 300 respuestas");
  await expect(usage.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(usage.getByText("Cuando se llega al tope, el bot deja de responder con IA y deriva a tu contacto. No se apaga.")).toBeVisible();

  const cap = usage.getByLabel("Tope diario de respuestas");
  await cap.fill("19");
  await cap.blur();
  await expect(usage.getByRole("alert")).toHaveText("El tope tiene que ser un número entero entre 20 y 300.");

  await cap.fill("20");
  await cap.blur();
  await expect(page.getByText("Tope guardado").first()).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("section-uso").getByLabel("Tope diario de respuestas")).toHaveValue("20");
  await expect(page.getByTestId("section-uso").getByTestId("usage-today")).toHaveText("Hoy: 0 de 20 respuestas");
});
