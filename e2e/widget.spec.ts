import { expect, test, type Page } from "@playwright/test";
import {
  answersOf,
  attentionNoticesOf,
  createSite,
  deleteUsers,
  installedAt,
  modelCallsOf,
  seedBotAnswers,
  seedModelSpend,
} from "./support/db";

// Spec 003. The customer's site is simulated on its own origin; the widget loads from the app.
// Chrome's local-network protections are relaxed in playwright.config.ts so these fake public
// sites can reach the app on localhost, as real sites reach the deployed app.
// Needs the app started with WIDGET_ALLOW_HTTP=true, AI_ANSWER_MODEL=mock/echo and AI_ALLOW_MOCK_MODEL=true.
const created: string[] = [];
test.afterAll(() => deleteUsers(created));

const hostPage = async (page: Page, host: string, domainId: string, appOrigin: string) => {
  await page.route(`http://${host}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><style>body{font-family:serif;background:#eef}</style></head>
        <body><h1>Sitio del cliente</h1>
        <script src="${appOrigin}/widget.js" data-domain-id="${domainId}" async></script></body></html>`,
    }),
  );
  await page.goto(`http://${host}/`);
};

const newSite = async (label: string, options?: Parameters<typeof createSite>[1]) => {
  const name = `${label}-${Date.now()}.test`;
  const site = await createSite(name, options);
  created.push(site.userId);
  return { ...site, name };
};

test("a visitor chats on the customer's site and finds the conversation after reloading", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("tienda");
  await hostPage(page, name, domainId, new URL(baseURL!).origin);

  // Criterion 3: the first load from the site itself completes the install step.
  await expect.poll(() => installedAt(domainId)).not.toBeNull();

  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  await expect(chat.getByText("¡Hola! Soy el asistente de prueba.")).toBeVisible();

  await chat.getByTestId("widget-input").fill("¿Hacen envíos?");
  await chat.getByTestId("widget-send").click();
  const reply = chat.locator('[data-testid="widget-message"][data-role="assistant"]').last();
  await expect(reply).toHaveText("Respuesta de prueba a: ¿Hacen envíos?");

  // The site's own styles did not leak into the chat, nor the chat into the site.
  await expect(page.getByRole("heading", { name: "Sitio del cliente" })).toHaveCSS("font-family", "serif");

  await page.reload();
  await page.getByRole("button", { name: "Abrir chat" }).click();
  await expect(chat.getByText("Respuesta de prueba a: ¿Hacen envíos?")).toBeVisible();
  await expect(chat.getByText("¿Hacen envíos?", { exact: true })).toBeVisible();
});

// Spec 004: the owner picks one color and the widget computes a readable text color.
test("the chat uses the owner's color with readable text", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("amarillo", { background: "#FACC15" });
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const header = page.frameLocator('iframe[data-brainance="chat"]').locator("header");
  await expect(header).toHaveCSS("background-color", "rgb(250, 204, 21)");
  await expect(header).toHaveCSS("color", "rgb(15, 23, 42)");
});

// Spec 004, criterion 7: over the daily cap, the fixed reply refers to the owner's contact.
test("over the site's daily cap, the bot refers to the owner's contact", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("tope", { contact: "WhatsApp +54 9 341 555-0101" });
  await seedBotAnswers(domainId, 300);
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  await chat.getByTestId("widget-input").fill("¿Hacen envíos?");
  await chat.getByTestId("widget-send").click();
  await expect(chat.locator('[data-testid="widget-message"][data-role="assistant"]').last()).toContainText(
    "WhatsApp +54 9 341 555-0101",
  );
  // Spec 010, criterion 4: the owner is told about the cap (EMAIL_PROVIDER=log in E2E).
  await expect.poll(async () => (await attentionNoticesOf(domainId))[0]).toMatchObject({ reason: "site_cap", notified: true });
});

// Spec 011, criteria 9 and 13: the owner's lower cap applies, and the fixed reply is stored as a derivation.
test("at the owner's daily cap, the bot derives instead of answering", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("tope-propio", { contact: "WhatsApp +54 9 341 555-0101", dailyAnswerCap: 20 });
  await seedBotAnswers(domainId, 19);
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  const reply = chat.locator('[data-testid="widget-message"][data-role="assistant"]').last();

  // Answer 20 still comes from the model.
  await chat.getByTestId("widget-input").fill("¿Hacen envíos?");
  await chat.getByTestId("widget-send").click();
  await expect(reply).toHaveText("Respuesta de prueba a: ¿Hacen envíos?");

  // Answer 21 is the fixed one, and the conversation needs attention.
  await chat.getByTestId("widget-input").fill("¿Y a Córdoba?");
  await chat.getByTestId("widget-send").click();
  await expect(reply).toContainText("WhatsApp +54 9 341 555-0101");
  await expect.poll(async () => (await attentionNoticesOf(domainId))[0]).toMatchObject({ reason: "site_cap" });
  const answers = await answersOf(domainId);
  expect(answers.slice(-2).map((a) => a.derivation)).toEqual([false, true]);
});

// Spec 010, criteria 1 and 12: when the bot derives, the owner is emailed after the visitor got
// the answer. The echo model repeats the question, so a question that says it lacks the data and quotes
// the contact is a derivation (QA of spec 011: the contact alone is not).
test("when the bot derives, the owner gets a notice and the answer is not delayed", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("aviso", { contact: "WhatsApp +54 9 341 555-0101" });
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  await chat.getByTestId("widget-input").fill("No tengo ese dato: ¿los llamo al WhatsApp +54 9 341 555-0101?");
  await chat.getByTestId("widget-send").click();
  await expect(chat.locator('[data-testid="widget-message"][data-role="assistant"]').last()).toContainText(
    "Respuesta de prueba a:",
  );
  await expect.poll(async () => (await attentionNoticesOf(domainId))[0]).toMatchObject({
    reason: "derivation",
    notified: true,
    notices: 1,
  });
});

// Spec 007, criterion 5: every answer records its model call (the mock model costs nothing).
test("each answer records its model call", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("registro");
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  await chat.getByTestId("widget-input").fill("Hola");
  await chat.getByTestId("widget-send").click();
  await expect(chat.locator('[data-testid="widget-message"][data-role="assistant"]').last()).toContainText("Hola");
  await expect.poll(() => modelCallsOf(domainId)).toEqual([{ requestedModel: "mock/echo", costUsd: "0.000000" }]);
});

// Spec 007, criterion 9: over the site's daily AI cost cap, the bot refers to the contact without the model.
test("over the site's daily AI cost cap, the bot refers to the owner's contact", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("costo", { contact: "WhatsApp +54 9 341 555-0101" });
  await seedModelSpend(domainId, 2);
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  await chat.getByTestId("widget-input").fill("¿Hacen envíos?");
  await chat.getByTestId("widget-send").click();
  const reply = chat.locator('[data-testid="widget-message"][data-role="assistant"]').last();
  await expect(reply).toContainText("WhatsApp +54 9 341 555-0101");
  await expect(reply).not.toContainText("Respuesta de prueba");
  expect(await modelCallsOf(domainId)).toHaveLength(1);
});

test("an unknown site id shows nothing and warns in the console", async ({ page, baseURL }) => {
  const warnings: string[] = [];
  page.on("console", (msg) => msg.type() === "warning" && warnings.push(msg.text()));
  await hostPage(page, "desconocido.test", crypto.randomUUID(), new URL(baseURL!).origin);

  await expect.poll(() => warnings.join("\n")).toContain("[BrAInance]");
  await expect(page.locator('[data-brainance="launcher"]')).toHaveCount(0);
});

test("another site cannot embed a customer's chat", async ({ page, baseURL }) => {
  const { domainId } = await newSite("victima");
  await hostPage(page, "otro-sitio.test", domainId, new URL(baseURL!).origin);

  await page.getByRole("button", { name: "Abrir chat" }).click();
  // frame-ancestors blocks the page: the chat UI never renders inside the iframe.
  await expect(page.frameLocator('iframe[data-brainance="chat"]').getByTestId("widget-input")).toHaveCount(0, {
    timeout: 5_000,
  });
  expect(await installedAt(domainId)).toBeNull();
});

test("messages over the length limit are not sent", async ({ page, baseURL }) => {
  const { domainId, name } = await newSite("largo");
  await hostPage(page, name, domainId, new URL(baseURL!).origin);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');

  await chat.getByTestId("widget-input").fill("a".repeat(1001));
  await expect(chat.getByText(/supera los 1000 caracteres/)).toBeVisible();
  await expect(chat.getByTestId("widget-send")).toBeDisabled();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the chat opens full screen and can be closed", async ({ page, baseURL }) => {
    const { domainId, name } = await newSite("movil");
    await hostPage(page, name, domainId, new URL(baseURL!).origin);
    await page.getByRole("button", { name: "Abrir chat" }).click();

    const frame = page.locator('iframe[data-brainance="chat"]');
    await expect(frame).toBeVisible();
    expect(await frame.boundingBox()).toMatchObject({ x: 0, y: 0, width: 390, height: 844 });

    await page.frameLocator('iframe[data-brainance="chat"]').getByTestId("widget-close").click();
    await expect(frame).toBeHidden();
    await expect(page.getByRole("button", { name: "Abrir chat" })).toBeVisible();
  });
});
