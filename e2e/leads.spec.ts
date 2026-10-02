import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { seedLead, siteIdByName } from "./support/db";
import { createTestUser, deleteTestUsers } from "./support/users";

test.skip(!process.env.CLERK_SECRET_KEY, "Needs Clerk test keys (E2E_CLERK_* secrets in CI)");

// Spec 005, criteria 12–14: the owner sees, exports and deletes their leads.
const created: string[] = [];
test.afterAll(() => deleteTestUsers(created));

test("the owner lists, exports and deletes leads", async ({ page }) => {
  const email = await createTestUser("leads");
  created.push(email);
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: email });
  await page.goto("/dashboard");
  const domain = `e2e-leads-${Date.now()}.com.ar`;
  const addSite = page.getByTestId("onboarding-checklist").getByTestId("step-add-site");
  await addSite.locator('input[name="domain"]').fill(domain);
  await addSite.getByRole("button", { name: "Agregar sitio" }).click();
  await expect(addSite).toHaveAttribute("data-done", "true");
  await seedLead(await siteIdByName(domain), "ana@example.com", { question: "¿Qué buscás?", answered: "=Tortas" });

  await page.getByRole("link", { name: "Leads" }).first().click();
  const row = page.getByTestId("lead-row");
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("ana@example.com");
  await expect(row).toContainText(domain);
  await expect(row).toContainText("¿Qué buscás?");

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByTestId("leads-export").click()]);
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv.startsWith("﻿Email,Sitio,Fecha,Respuestas")).toBe(true);
  expect(csv).toContain(`ana@example.com,${domain},`);
  expect(csv).toContain("¿Qué buscás? =Tortas");

  await row.getByRole("button", { name: "Borrar ana@example.com" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Borrar" }).click();
  await expect(page.getByTestId("leads-empty")).toBeVisible();
});
