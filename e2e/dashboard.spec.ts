import { expect, test } from "@playwright/test";
import { completeOnboarding, seedConversation, seedLead, siteIdByName } from "./support/db";
import { createTestUser, deleteTestUsers, signInAs } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 007, criterion 11: once the bot is set up, the dashboard shows what it brought in.
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

test("the dashboard shows conversations and leads", async ({ page }) => {
  const email = await createTestUser("dashboard");
  created.push(email);
  await signInAs(page, email);
  await page.goto("/dashboard");
  const domain = `e2e-dash-${Date.now()}.com.ar`;
  const checklist = page.getByTestId("onboarding-checklist");
  await checklist.getByTestId("step-add-site").locator('input[name="domain"]').fill(domain);
  await checklist.getByTestId("step-add-site").getByRole("button", { name: "Agregar sitio" }).click();
  await expect(checklist.getByTestId("step-add-site")).toHaveAttribute("data-done", "true");

  const siteId = await siteIdByName(domain);
  await completeOnboarding(siteId);
  await seedConversation(siteId);
  await seedLead(siteId, "ana@example.com", { question: "¿Qué buscás?", answered: "Tortas" });
  await page.reload();

  await expect(page.getByTestId("owner-metrics")).toBeVisible();
  await expect(page.getByTestId("metric-conversations")).toHaveText("1");
  await expect(page.getByTestId("metric-leads")).toHaveText("1");
  await page.getByRole("link", { name: "Últimos 30 días" }).click();
  await expect(page).toHaveURL(/days=30/);
  await expect(page.getByTestId("metric-conversations")).toHaveText("1");

  // Spec 011, criteria 1, 3 and 5: the seeded answer derived; nobody asked for a person; no response time yet.
  await expect(page.getByTestId("metric-answers")).toHaveText("1");
  await expect(page.getByTestId("metric-derived")).toHaveText("1");
  await expect(page.getByText(/100\s?% de las respuestas/)).toBeVisible();
  await expect(page.getByTestId("metric-human-requests")).toHaveText("0");
  await expect(page.getByTestId("metric-response-time")).toHaveText("Sin datos todavía");

  // Spec 011, criterion 11: with the site chosen, today's usage links to its cap.
  await page.goto(`/dashboard?site=${siteId}`);
  const usage = page.getByTestId("usage-today");
  await expect(usage).toHaveText("Hoy: 1 de 300 respuestas");
  await usage.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/settings/${siteId}#uso$`));
  await expect(page.getByTestId("section-uso")).toBeVisible();
});
