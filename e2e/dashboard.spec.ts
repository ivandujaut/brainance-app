import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { completeOnboarding, seedConversation, seedLead, siteIdByName } from "./support/db";
import { createTestUser, deleteTestUsers } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 007, criterion 11: once the bot is set up, the dashboard shows what it brought in.
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

test("the dashboard shows conversations and leads", async ({ page }) => {
  const email = await createTestUser("dashboard");
  created.push(email);
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: email });
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
});
