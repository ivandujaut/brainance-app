import path from "node:path";
import { test } from "@playwright/test";
import sharp from "sharp";
import { createSite, deleteUsers } from "../../e2e/support/db";
import { CONVERSATION, bakeryAfter, bakeryBefore } from "./bakery-site";

// Spec 009: the landing's before/after. The real widget, loaded by its embed script on the bakery's
// own origin; only its conversation comes from fixtures, so no AI model is needed.
// Run with `npm run landing:screens:site` against the app started for the widget E2E.
const HOST = "laespiga.com.ar";
const out = (name: string) => path.join(process.cwd(), "public/landing", `${name}.webp`);
const save = (png: Buffer, name: string) => sharp(png).resize({ width: 2400 }).webp({ quality: 82 }).toFile(out(name));

test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

let userId: string | undefined;
test.afterAll(() => deleteUsers(userId ? [userId] : []));

test("before and after on the bakery's site", async ({ page, context, baseURL }) => {
  const site = await createSite(HOST, {
    background: "#A0642A",
    leadCapture: false,
    welcomeMessage: "¡Hola! Soy el asistente de La Espiga. ¿En qué te ayudo?",
  });
  userId = site.userId;

  await context.route(/\/api\/widget\/[^/]+\/conversation/, (route) => {
    const polling = new URL(route.request().url()).searchParams.has("after");
    return route.fulfill({
      json: { messages: polling ? [] : CONVERSATION, live: false, roomId: null, leadCaptured: true },
    });
  });

  const origin = new URL(baseURL!).origin;
  // Chrome upgrades navigations to public domains like this one to https, so both are served.
  await page.route(new RegExp(`^https?://${HOST.replaceAll(".", "\\.")}/`), (route) => {
    const before = new URL(route.request().url()).pathname === "/antes";
    return route.fulfill({ contentType: "text/html", body: before ? bakeryBefore() : bakeryAfter(origin, site.domainId) });
  });
  await page.goto(`https://${HOST}/antes`);
  await save(await page.screenshot(), "site-before");

  await page.goto(`https://${HOST}/`);
  await page.getByRole("button", { name: "Abrir chat" }).click();
  const chat = page.frameLocator('iframe[data-brainance="chat"]');
  await chat.getByText("Marta te lo confirma").waitFor();
  await page.waitForTimeout(300);
  await save(await page.screenshot(), "site-after");
});
