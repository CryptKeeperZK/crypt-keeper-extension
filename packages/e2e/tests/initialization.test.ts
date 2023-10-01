import path from "path";

import { DEFAULT_BACKUP_PASSWORD } from "../constants";
import { expect, test } from "../fixtures";
import { connectCryptKeeper, connectWallet, createAccount, lockAccount, unlockAccount } from "../helpers/account";

test.describe("initialization", () => {
  test("should load demo and unlock account [health-check]", async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });
    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context });

    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });

    await expect(page.getByText("Connected to MetaMask")).toBeVisible();
  });

  test("should create account from backup file properly [health-check]", async ({
    page,
    cryptKeeperExtensionId,
    context,
  }) => {
    const backupFilePath = path.resolve(__dirname, "../backups/0_backup.json");

    const cryptKeeper = await connectCryptKeeper(page);
    await cryptKeeper.openBackupOnboarding();
    await cryptKeeper.createAccountFromBackup({ password: DEFAULT_BACKUP_PASSWORD, backupFilePath });
    
    await connectCryptKeeper(page);

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context, password: DEFAULT_BACKUP_PASSWORD });

    await expect(page.getByText(/Account/)).toHaveCount(2);
  });

  test("should not corrupt storage if backup file is invalid", async ({ page, cryptKeeperExtensionId }) => {
    const invalidBackups = [
      path.resolve(__dirname, "../backups/1_invalid_backup.json"),
      path.resolve(__dirname, "../backups/2_invalid_backup.json"),
      path.resolve(__dirname, "../backups/3_invalid_backup.json"),
      path.resolve(__dirname, "../backups/4_invalid_backup.json"),
      path.resolve(__dirname, "../backups/5_invalid_backup.json"),
      path.resolve(__dirname, "../backups/6_invalid_backup.json"),
      path.resolve(__dirname, "../backups/7_invalid_backup.json"),
      path.resolve(__dirname, "../backups/8_invalid_backup.json"),
    ];

    const popup = await connectCryptKeeper(page);
    await popup.openBackupOnboarding();

    /* eslint-disable no-await-in-loop,no-restricted-syntax */
    for (const backupFilePath of invalidBackups) {
      await popup.createAccountFromBackup({
        password: DEFAULT_BACKUP_PASSWORD,
        backupFilePath,
      });
      await expect(popup.getByText("This backup file is not authentic")).toBeVisible();
    }
    /* eslint-enable no-await-in-loop */

    await popup.createAccountFromBackup({
      password: DEFAULT_BACKUP_PASSWORD,
      backupFilePath: path.resolve(__dirname, "../backups/0_backup.json"),
    });
    await popup.connectIdentity();
    await popup.close();

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();
  });
});
