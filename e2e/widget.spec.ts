import { expect, test, type Page } from "@playwright/test";
import { createSite, deleteUsers, installedAt } from "./support/db";

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

const newSite = async (label: string) => {
  const name = `${label}-${Date.now()}.test`;
  const site = await createSite(name);
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
