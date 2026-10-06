import { expect, test } from "@playwright/test";
import { messagesOf, seedConversation, siteIdByName } from "./support/db";
import { createTestUser, deleteTestUsers, signInAs } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 006, criteria 1–4 and 8–11 from the owner's side.
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

test("the owner opens a conversation, takes over, replies and hands it back", async ({ page }) => {
  const email = await createTestUser("inbox");
  created.push(email);
  await signInAs(page, email);
  await page.goto("/dashboard");
  const domain = `e2e-inbox-${Date.now()}.com.ar`;
  const addSite = page.getByTestId("onboarding-checklist").getByTestId("step-add-site");
  await addSite.locator('input[name="domain"]').fill(domain);
  await addSite.getByRole("button", { name: "Agregar sitio" }).click();
  await expect(addSite).toHaveAttribute("data-done", "true");
  const roomId = await seedConversation(await siteIdByName(domain));

  await page.getByRole("link", { name: "Conversaciones" }).first().click();
  const item = page.getByTestId("inbox-item");
  await expect(item).toHaveCount(1);
  await expect(item).toContainText("Necesita atención");
  await expect(item.getByTestId("inbox-unread")).toHaveText("1");

  await page.getByRole("link", { name: "Necesita atención", exact: true }).click();
  await expect(item).toHaveCount(1);
  await item.click();
  const pane = page.getByTestId("conversation-pane");
  await expect(pane).toContainText("¿Tienen sin TACC?");
  await expect(item.getByTestId("inbox-unread")).toHaveCount(0);

  await pane.getByRole("button", { name: "Tomar el control" }).click();
  await expect(pane.getByTestId("conversation-mode")).toHaveText("Estás atendiendo");
  await pane.getByLabel("Tu respuesta").fill("Sí, los jueves hacemos sin TACC.");
  await pane.getByRole("button", { name: "Enviar" }).click();
  await expect(pane.locator('[data-testid="conversation-message"][data-role="owner"]')).toHaveText(/los jueves/);
  expect(await messagesOf(roomId)).toContain("owner:Sí, los jueves hacemos sin TACC.");

  await pane.getByRole("button", { name: "Devolver al bot" }).click();
  await expect(pane.getByTestId("conversation-mode")).toHaveText("Responde el bot");
  await expect(pane).toContainText("Te vuelve a atender el asistente virtual.");
});
