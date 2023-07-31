import path from "path";

import { DEFAULT_BACKUP_PASSWORD } from "../constants";
import { expect, test } from "../fixtures";
import { connectCryptKeeper, connectWallet, createAccount, lockAccount, unlockAccount } from "../helpers/account";

test.describe("initialization", () => {
  test("should load demo and unlock account", async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });
    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context });

    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });

    await expect(page.getByText("Connected to MetaMask")).toBeVisible();
  });

  test("should create account from backup file properly", async ({ page, cryptKeeperExtensionId, context }) => {
    const backupFilePath = path.resolve(__dirname, "../backups/0_backup.json");

    const cryptKeeper = await connectCryptKeeper(page);
    await cryptKeeper.createAccountFromBackup({ password: DEFAULT_BACKUP_PASSWORD, backupFilePath });

    await cryptKeeper.connectIdentity();
    await cryptKeeper.close();

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context, password: DEFAULT_BACKUP_PASSWORD });

    await expect(page.getByText(/Account/)).toHaveCount(2);
  });
});
