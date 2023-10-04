import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";
import { initialSetup } from "@synthetixio/synpress/commands/metamask";
import { prepareMetamask } from "@synthetixio/synpress/helpers";
import waitForExpect from "wait-for-expect";

import fs from "fs";
import path from "path";

import { METAMASK_PASSWORD, METAMASK_SEED_PHRASE, NETWORK } from "../constants";
import { CryptKeeper } from "../pages";

export interface TestExtension {
  page: Page;
  context: BrowserContext;
  cryptKeeperExtensionId: string;
}

export const test = base.extend<TestExtension>({
  context: [
    async ({}, use) => {
      const metamaskPath = await prepareMetamask(process.env.METAMASK_VERSION || "10.28.1");
      const cryptKeeperPath = path.join(__dirname, "../../app/dist");
      const downloadsPath = path.join(__dirname, "../playwright-downloads");
      const userPath = path.join(__dirname, "../user-data");

      const context = await chromium.launchPersistentContext(userPath, {
        headless: false,
        downloadsPath,
        args: [
          process.env.HEADLESS ? `--headless=new` : "",
          process.env.CI ? "--disable-gpu" : "",
          `--disable-extensions-except=${cryptKeeperPath},${metamaskPath}`,
          `--load-extension=${cryptKeeperPath},${metamaskPath}`,
          "--disable-dev-shm-usage",
          "--no-sandbox",
          "--remote-debugging-port=9222",
        ].filter(Boolean),
      });

      // eslint-disable-next-line playwright/valid-expect
      await waitForExpect(() => {
        test.expect(context.backgroundPages()).toHaveLength(1);
        test.expect(context.serviceWorkers()).toHaveLength(1);
      });

      const [metamaskBackground] = context.backgroundPages();
      await metamaskBackground.waitForTimeout(2000);
      const metamaskExtensionUrl = metamaskBackground.url();

      if (!metamaskExtensionUrl.includes(process.env.METAMASK_EXTENSION_ID!)) {
        // eslint-disable-next-line no-console
        console.error("MetaMask extension id doesn't match with dowloaded version", metamaskExtensionUrl);
        process.exit(-1);
      } else {
        // eslint-disable-next-line no-console
        console.log("MetaMask url", metamaskExtensionUrl);
      }

      await initialSetup(chromium, {
        secretWordsOrPrivateKey: METAMASK_SEED_PHRASE,
        network: NETWORK,
        password: METAMASK_PASSWORD,
        enableAdvancedSettings: true,
      });

      await use(context);
      await deleteCryptKeeperStorage(context);

      if (!fs.existsSync(downloadsPath)) {
        return;
      }

      fs.rmSync(downloadsPath, { recursive: true, force: true });

      await context.close();
    },
    { scope: "test" },
  ],

  cryptKeeperExtensionId: [
    async ({ context }, use) => {
      const [background] = context.serviceWorkers();

      const extensionId = background.url().split("/")[2];
      await use(extensionId);
    },
    { scope: "test" },
  ],

  page: [
    async ({ page }, use) => {
      await page.goto("/");
      await page.bringToFront();

      await use(page);
      await page.close();
    },
    { scope: "test" },
  ],
});

async function deleteCryptKeeperStorage(context: BrowserContext): Promise<void> {
  const [background] = context.serviceWorkers();
  const extensionId = background.url().split("/")[2];

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  const extension = new CryptKeeper(page);
  await extension.settings.openPage();
  await extension.settings.openTab("Backup");
  await extension.settings.deleteStorage();
  await extension.close();
}

export const { expect } = test;
