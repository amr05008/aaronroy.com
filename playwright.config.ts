import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4321",
    // Always spin up a fresh production preview. Reusing an existing server
    // silently tests against whatever is already on :4321 — e.g. a running
    // `npm run dev`, which renders drafts and skips the fresh build, producing
    // false pass/fail results.
    reuseExistingServer: false,
    timeout: 120000,
  },
});
