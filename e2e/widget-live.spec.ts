import { expect, test } from "@playwright/test";
import { createSite, deleteUsers, messagesOf, ownerReleases, ownerSays, ownerTakesOver, roomOf } from "./support/db";

// Spec 006 in the widget: a person of the business takes over and the visitor sees it without
// reloading. No Pusher keys here, so this also covers the polling fallback (ADR 0007).
const created: string[] = [];
test.afterAll(() => deleteUsers(created));

test("the visitor sees the takeover and the owner's messages, and the bot stays quiet", async ({ page, baseURL }) => {
  test.setTimeout(60_000);
  const name = `vivo-${Date.now()}.test`;
  const { userId, domainId } = await createSite(name, { leadCapture: false });
  created.push(userId);
  await page.route(`http://${name}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body><h1>Sitio</h1>
        <script src="${new URL(baseURL!).origin}/widget.js" data-domain-id="${domainId}" async></script></body></html>`,
    }),
  );
  await page.goto(`http://${name}/`);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  const assistant = chat.locator('[data-testid="widget-message"][data-role="assistant"]');

  await chat.getByTestId("widget-input").fill("¿Tienen sin TACC?");
  await chat.getByTestId("widget-send").click();
  await expect(assistant.last()).toHaveText("Respuesta de prueba a: ¿Tienen sin TACC?");
  const roomId = (await roomOf(domainId))!;

  // Criterion 8 and 9: the takeover notice and the owner's reply arrive by polling (idle: every 15 s).
  await ownerTakesOver(roomId, name);
  await ownerSays(roomId, "Hola, soy Laura. Sí, los jueves hacemos sin TACC.");
  await expect(chat.getByTestId("widget-notice")).toHaveText(`Ahora te atiende una persona de ${name}.`, { timeout: 20_000 });
  const owner = chat.locator('[data-testid="widget-message"][data-role="owner"]');
  await expect(owner).toHaveText("Hola, soy Laura. Sí, los jueves hacemos sin TACC.");

  // Criterion 10: while live, the visitor's message is stored and the model is not called.
  await chat.getByTestId("widget-input").fill("¿A qué hora?");
  await chat.getByTestId("widget-send").click();
  await expect(chat.locator('[data-testid="widget-message"][data-role="user"]').last()).toHaveText("¿A qué hora?");
  await expect.poll(() => messagesOf(roomId)).toContain("user:¿A qué hora?");
  await page.waitForTimeout(1500);
  // The welcome message and the first answer: no new bot reply.
  await expect(assistant).toHaveCount(2);
  expect(await messagesOf(roomId)).not.toContain("assistant:Respuesta de prueba a: ¿A qué hora?");

  // While live the widget polls every 3 s.
  await ownerSays(roomId, "De 8 a 13.");
  await expect(owner.last()).toHaveText("De 8 a 13.", { timeout: 8_000 });

  // The conversation survives a reload with its roles.
  await page.reload();
  await page.getByRole("button", { name: "Abrir chat" }).click();
  await expect(owner).toHaveCount(2);
  await expect(chat.getByTestId("widget-notice")).toHaveCount(1);
});

// QA of spec 011: the owner took over, replied and handed back while the widget had not polled yet.
// The visitor's next message must show after all of that, in the order it was stored.
test("the conversation keeps its order when the visitor writes before the widget caught up", async ({ page, baseURL }) => {
  const name = `orden-${Date.now()}.test`;
  const { userId, domainId } = await createSite(name, { leadCapture: false });
  created.push(userId);
  await page.route(`http://${name}/**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><body><h1>Sitio</h1>
        <script src="${new URL(baseURL!).origin}/widget.js" data-domain-id="${domainId}" async></script></body></html>`,
    }),
  );
  await page.goto(`http://${name}/`);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  // Spec 003: the cursor is in the input as soon as the chat works.
  await expect(chat.getByTestId("widget-input")).toBeFocused();
  const assistant = chat.locator('[data-testid="widget-message"][data-role="assistant"]');

  await chat.getByTestId("widget-input").fill("¿Tienen sin TACC?");
  await chat.getByTestId("widget-send").click();
  await expect(assistant.last()).toHaveText("Respuesta de prueba a: ¿Tienen sin TACC?");
  const roomId = (await roomOf(domainId))!;
  // The answer is stored right after it reaches the visitor; a real owner never takes over sooner.
  await expect.poll(() => messagesOf(roomId)).toContain("assistant:Respuesta de prueba a: ¿Tienen sin TACC?");
  await ownerTakesOver(roomId, name);
  await ownerSays(roomId, "Hola, te atiendo yo");
  await ownerReleases(roomId);

  await chat.getByTestId("widget-input").fill("¿Tienen estacionamiento?");
  await chat.getByTestId("widget-send").click();
  await expect(assistant.last()).toHaveText("Respuesta de prueba a: ¿Tienen estacionamiento?");
  const timeline = chat.locator('[data-testid="widget-message"], [data-testid="widget-notice"]');
  await expect(timeline).toHaveText([
    "¡Hola! Soy el asistente de prueba.",
    "¿Tienen sin TACC?",
    "Respuesta de prueba a: ¿Tienen sin TACC?",
    `Ahora te atiende una persona de ${name}.`,
    /Hola, te atiendo yo/,
    "Te vuelve a atender el asistente virtual.",
    "¿Tienen estacionamiento?",
    "Respuesta de prueba a: ¿Tienen estacionamiento?",
  ]);
});
