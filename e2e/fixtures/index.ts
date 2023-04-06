import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";

import path from "path";

export interface TestExtension {
  context: BrowserContext;
  cryptKeeperExtensionId: string;
  app: Page;
  cryptKeeper: Page;
}

export const test = base.extend<TestExtension>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const userDataDirectory = path.join(__dirname, `../tmp/crypt-keeper/${+new Date()}${Math.random()}`);
    const pathToExtension = path.join(__dirname, "../../dist");
    const context = await chromium.launchPersistentContext(userDataDirectory, {
      headless: false,
      args: [
        process.env.CI ? `--headless=new` : "",
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        "--disable-dev-shm-usage",
        "--no-sandbox",
      ].filter(Boolean),
    });
    await use(context);
    await context.close();
  },

  app: async ({ context }, use) => {
    const [page] = context.pages();
    await page.goto("/");

    await use(page);
    await context.close();
  },

  cryptKeeper: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent("serviceworker");
    }

    context.on("page", async (page: Page) => {
      await page.waitForLoadState();

      const title = await page.title();

      if (title.toLowerCase() === "crypt keeper") {
        await use(page);
      }
    });
  },

  cryptKeeperExtensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent("serviceworker");
    }

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});

export const { expect } = test;
