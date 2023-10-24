import path from "path";

import type { IImportIdentityArgs } from "../pages/cryptKeeper/Identities";
import type { Page } from "@playwright/test";

import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("import external identity", () => {
  const importIdentityFromDemo = async (page: Page, args: IImportIdentityArgs): Promise<void> => {
    const cryptKeeper = new CryptKeeper(await page.context().waitForEvent("page"));
    await cryptKeeper.identities.importIdentity(args);
    await cryptKeeper.close();
    await page.goto("/");
  };

  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context, isImport: true });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Connected to MetaMask")).toBeVisible();

    await page.goto("/");
  });

  test("should import identity properly [health-check]", async ({ page, cryptKeeperExtensionId }) => {
    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    const cryptKeeper = new CryptKeeper(page);

    await cryptKeeper.identities.goToImportIdentity();
    await cryptKeeper.identities.importIdentity({ name: "Test #1", trapdoor: "1", nullifier: "1" });

    await expect(cryptKeeper.getByText(/Test #1/)).toHaveCount(1);
  });

  test("should import identity from demo properly [health-check]", async ({ page, cryptKeeperExtensionId }) => {
    await page.getByLabel("Trapdoor").fill("1");
    await page.getByLabel("Nullifier").fill("1");
    await page.getByTestId("import-identity").click();

    await importIdentityFromDemo(page, { name: "Test #1" });
    await page.goto("/");

    await page.getByTestId("import-identity").click();
    await importIdentityFromDemo(page, { name: "Test #2", trapdoor: "2", nullifier: "2" });

    await page.getByLabel("Trapdoor").fill("3");
    await page.getByTestId("import-identity").click();
    await importIdentityFromDemo(page, { name: "Test #3", nullifier: "3" });

    await page.getByLabel("Nullifier").fill("4");
    await page.getByTestId("import-identity").click();
    await importIdentityFromDemo(page, { name: "Test #4", trapdoor: "4" });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await expect(page.getByText(/Test #1/)).toHaveCount(1);
    await expect(page.getByText(/Test #2/)).toHaveCount(1);
    await expect(page.getByText(/Test #3/)).toHaveCount(1);
    await expect(page.getByText(/Test #4/)).toHaveCount(1);
  });

  test("should import identity with json files properly [health-check]", async ({ page, cryptKeeperExtensionId }) => {
    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    const cryptKeeper = new CryptKeeper(page);

    const invalidBackups = [
      path.resolve(__dirname, "../backups/12_invalid_identity.json"),
      path.resolve(__dirname, "../backups/13_empty_identity.json"),
    ];

    await cryptKeeper.identities.goToImportIdentity();

    /* eslint-disable no-await-in-loop,no-restricted-syntax */
    for (const backupFilePath of invalidBackups) {
      await cryptKeeper.identities.importIdentityWithFile({
        name: "Test",
        filepath: backupFilePath,
      });
    }
    /* eslint-enable no-await-in-loop */
    await cryptKeeper.getByText("Reject", { exact: true }).click();
    await cryptKeeper.getByText("Reject", { exact: true }).click();

    const backupFilePaths = [
      path.resolve(__dirname, "../backups/9_identity.json"),
      path.resolve(__dirname, "../backups/10_identity.json"),
      path.resolve(__dirname, "../backups/11_identity.json"),
    ];

    /* eslint-disable no-await-in-loop,no-restricted-syntax */
    for (const backupFilePath of backupFilePaths) {
      await cryptKeeper.identities.goToImportIdentity();
      await cryptKeeper.identities.importIdentityWithFile({
        name: "Test",
        filepath: backupFilePath,
        walletType: "eth",
      });
    }
    /* eslint-enable no-await-in-loop */

    await expect(cryptKeeper.getByText(/Test/)).toHaveCount(3);
  });
});
