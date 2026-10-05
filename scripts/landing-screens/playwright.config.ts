import { defineConfig } from "@playwright/test";
import base from "../../playwright.config";

// The before/after shots (spec 009) reuse the E2E setup: same browser flags and app server.
export default defineConfig({
  ...base,
  testDir: ".",
  // No Clerk here: the shots only use the widget.
  globalSetup: undefined,
  testMatch: "*.shoot.ts",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
});
