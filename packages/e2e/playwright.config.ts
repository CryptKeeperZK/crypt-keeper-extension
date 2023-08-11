import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

import path from "path";

dotenv.config({ path: "./.env.test" });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: process.env.CI ? 120_000 : 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["github"], ["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.DEMO_URL || "http://localhost:1234",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: false,
    acceptDownloads: true,
    permissions: ["clipboard-read", "clipboard-write"],
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: !process.env.DEMO_URL
    ? [
        {
          command: "pnpm run merkle",
          cwd: path.resolve(__dirname, "../merkle-mock-server"),
          url: "http://localhost:8090",
          timeout: 120 * 1000,
          reuseExistingServer: !process.env.CI,
        },
        {
          command: "pnpm run start",
          cwd: path.resolve(__dirname, "../demo"),
          url: "http://localhost:1234",
          timeout: 120 * 1000,
          reuseExistingServer: !process.env.CI,
        },
      ]
    : [],
});
