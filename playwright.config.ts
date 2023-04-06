import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

import path from "path";

dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e/tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["github"], ["list"], ["html"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:1234",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    // {
    //   command: "npm run merkle",
    //   url: "http://127.0.0.1:8090",
    //   timeout: 120 * 1000,
    //   reuseExistingServer: !process.env.CI,
    // },
    {
      command: "npm run start",
      cwd: path.resolve(__dirname, "./demo"),
      url: "http://localhost:1234",
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
