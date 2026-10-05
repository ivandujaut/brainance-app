// Turns the statically rendered owner screens (see owner.render.tsx) into the
// landing screenshots: public/landing/{inbox,dashboard}-{light,dark}.webp.
// Usage: npm run landing:screens
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "../..");
const outDir = path.join(root, "scripts/landing-screens/out");
const publicDir = path.join(root, "public/landing");

// The hero uses the light shots in both themes; the sign-in panel also uses the dark inbox.
const SHOTS = { inbox: ["light", "dark"], dashboard: ["light"] };

const fonts =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700" +
  "&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&display=swap";

// A modern UA makes Google Fonts serve woff2.
const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";

const page = (body, theme) => `<!doctype html>
<html lang="es" class="${theme}">
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="${fonts}" />
<link rel="stylesheet" href="screens.css" />
<style>
:root { --font-display: "Fraunces"; }
body { font-family: "Plus Jakarta Sans", sans-serif; }
/* A still frame: skip entry animations and land on their final state. */
*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }
</style>
</head>
<body class="bg-background text-foreground antialiased">${body}</body>
</html>`;

// Pages first: Tailwind keeps `.dark` rules only if it sees the class in its content.
for (const [screen, themes] of Object.entries(SHOTS)) {
  const body = readFileSync(path.join(outDir, `${screen}.body.html`), "utf8");
  for (const theme of themes) writeFileSync(path.join(outDir, `${screen}-${theme}.html`), page(body, theme));
}
execFileSync(
  "npx",
  [
    "tailwindcss",
    "-c",
    "tailwind.config.ts",
    "-i",
    "src/app/globals.css",
    "--content",
    "scripts/landing-screens/out/*.html",
    "-o",
    "scripts/landing-screens/out/screens.css",
  ],
  { cwd: root, stdio: "inherit" },
);

mkdirSync(publicDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
try {
  for (const name of Object.entries(SHOTS).flatMap(([screen, themes]) => themes.map((theme) => `${screen}-${theme}`))) {
    const file = path.join(outDir, `${name}.html`);
    const tab = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    // Fetch Google Fonts with curl so it honours the shell's proxy settings
    // (Chromium ignores HTTPS_PROXY).
    await tab.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
      route.fulfill({
        body: execFileSync("curl", ["-sSfL", "-A", USER_AGENT, route.request().url()]),
        contentType: route.request().url().includes("googleapis") ? "text/css" : "font/woff2",
      }),
    );
    await tab.goto(`file://${file}`, { waitUntil: "networkidle" });
    await tab.evaluate(() => document.fonts.ready);
    const png = await tab.screenshot();
    await sharp(png)
      .resize({ width: 2400 })
      .webp({ quality: 82 })
      .toFile(path.join(publicDir, `${name}.webp`));
    await tab.close();
    console.log(`public/landing/${name}.webp`);
  }
} finally {
  await browser.close();
}
