import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global.setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Lets sandboxes with a preinstalled Chromium skip `playwright install`.
        launchOptions: {
          executablePath: process.env.PW_CHROMIUM_PATH || undefined,
          // The widget E2E serves fake customer sites on public-looking origins that load the app
          // from localhost; Chrome's local-network protections would block that in tests only.
          args: [
            "--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessRespectPreflightResults",
          ],
        },
      },
    },
  ],
  // Against a deployed preview (E2E_BASE_URL) there is nothing to start.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${PORT}`,
        // Like a Vercel preview, so test-only routes exist and the E2E can check they need sign-in.
        env: { ...(process.env as Record<string, string>), VERCEL_ENV: "preview" },
        // A static file: readiness does not depend on Clerk or the database.
        url: `${baseURL}/widget.js`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
