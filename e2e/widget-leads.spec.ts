import { expect, test, type Page } from "@playwright/test";
import { createSite, deleteUsers, leadsOf } from "./support/db";

// Spec 005 in the widget. Same setup as e2e/widget.spec.ts (mock model, HTTP origins allowed);
// owner emails go to the log adapter (EMAIL_PROVIDER defaults to log outside production).
const created: string[] = [];
test.afterAll(() => deleteUsers(created));

const openChat = async (page: Page, options: Parameters<typeof createSite>[1], appOrigin: string) => {
  const name = `leads-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.test`;
  const site = await createSite(name, options);
  created.push(site.userId);
  await page.route(`http://${name}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body><h1>Sitio</h1>
        <script src="${appOrigin}/widget.js" data-domain-id="${site.domainId}" async></script></body></html>`,
    }),
  );
  await page.goto(`http://${name}/`);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  return { chat: page.frameLocator('iframe[data-brainance="chat"]'), domainId: site.domainId, name };
};

test("the lead card appears after the first answer and stores the visitor's data", async ({ page, baseURL }) => {
  const { chat, domainId, name } = await openChat(page, { leadQuestion: "¿Qué estás buscando?" }, new URL(baseURL!).origin);

  // Criterion 1: not before the first answer.
  await expect(chat.getByTestId("widget-input")).toBeEnabled();
  await expect(chat.getByTestId("lead-card")).toHaveCount(0);
  await chat.getByTestId("widget-input").fill("¿Hacen envíos?");
  await chat.getByTestId("widget-send").click();
  const card = chat.getByTestId("lead-card");
  await expect(card).toBeVisible();
  await expect(card.getByTestId("lead-consent")).toContainText(`Al enviar, aceptás que ${name}`);
  // Spec 008, criterion 8: the notice links to the privacy policy, in a new tab.
  await expect(card.getByTestId("lead-privacy")).toHaveAttribute("href", "/privacidad");
  await expect(card.getByTestId("lead-privacy")).toHaveAttribute("target", "_blank");

  // Criterion 4: an invalid email is not sent.
  await card.getByLabel("Tu email").fill("ana@");
  await card.getByRole("button", { name: "Enviar" }).click();
  await expect(card.getByRole("alert")).toHaveText("Ingresá un email válido.");

  // Criterion 5: a valid submission confirms and is stored with the answers.
  await card.getByLabel("Tu email").fill("ana@example.com");
  await card.getByLabel(/¿Qué estás buscando\?/).fill("Tortas");
  await card.getByRole("button", { name: "Enviar" }).click();
  await expect(chat.getByTestId("lead-thanks")).toHaveText(`¡Gracias! ${name} te va a contactar a ana@example.com.`);
  await expect(card).toHaveCount(0);
  expect(await leadsOf(domainId)).toEqual([{ email: "ana@example.com", answers: ["Tortas"] }]);

  // ...and the card does not come back on its own after reloading.
  await page.reload();
  await page.getByRole("button", { name: "Abrir chat" }).click();
  await expect(chat.getByTestId("lead-open")).toBeVisible();
  await expect(chat.getByTestId("lead-card")).toHaveCount(0);

  // Criterion 6: "Dejar mis datos" updates the same lead.
  await chat.getByTestId("lead-open").click();
  await chat.getByTestId("lead-card").getByLabel("Tu email").fill("ana.perez@example.com");
  await chat.getByTestId("lead-card").getByRole("button", { name: "Enviar" }).click();
  await expect(chat.getByTestId("lead-thanks")).toContainText("ana.perez@example.com");
  expect(await leadsOf(domainId)).toEqual([{ email: "ana.perez@example.com", answers: [] }]);
});

test("'Ahora no' hides the card for good, but the visitor can still open it", async ({ page, baseURL }) => {
  const { chat } = await openChat(page, {}, new URL(baseURL!).origin);
  await chat.getByTestId("widget-input").fill("Hola");
  await chat.getByTestId("widget-send").click();
  await chat.getByTestId("lead-card").getByRole("button", { name: "Ahora no" }).click();
  await expect(chat.getByTestId("lead-card")).toHaveCount(0);

  // Criterion 3: it does not come back with the next answer, nor after reloading.
  await chat.getByTestId("widget-input").fill("¿Y los sábados?");
  await chat.getByTestId("widget-send").click();
  await expect(chat.locator('[data-testid="widget-message"][data-role="assistant"]').last()).toContainText("sábados");
  await expect(chat.getByTestId("lead-card")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Abrir chat" }).click();
  await expect(chat.getByTestId("widget-input")).toBeEnabled();
  await expect(chat.getByTestId("lead-card")).toHaveCount(0);

  await chat.getByTestId("lead-open").click();
  await expect(chat.getByTestId("lead-card")).toBeVisible();
});

test("with lead capture off there is no card nor button", async ({ page, baseURL }) => {
  const { chat } = await openChat(page, { leadCapture: false }, new URL(baseURL!).origin);
  await chat.getByTestId("widget-input").fill("Hola");
  await chat.getByTestId("widget-send").click();
  await expect(chat.locator('[data-testid="widget-message"][data-role="assistant"]').last()).toContainText("Hola");
  await expect(chat.getByTestId("lead-card")).toHaveCount(0);
  await expect(chat.getByTestId("lead-open")).toHaveCount(0);
});
