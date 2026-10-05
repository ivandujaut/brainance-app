import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Renders real dashboard pages with fixture data to static HTML for the landing's product shots
// (spec 009). Not part of `npm test`: run with `npm run landing:screens`.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { include: ["scripts/landing-screens/*.render.tsx"], environment: "node" },
});
