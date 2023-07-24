import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("backup", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Connected to Metamask")).toBeVisible();
  });

  test("should download backup properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    const path = await extension.settings.downloadBackup();

    expect(path).toBeDefined();

    await extension.goHome();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Backup download")).toBeVisible();
  });

  test("should download and upload backup properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth" });
    await expect(extension.getByText(/Account/)).toHaveCount(2);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    const backupFilePath = await extension.settings.downloadBackup();
    expect(backupFilePath).toBeDefined();

    await extension.settings.openTab("Backup");
    await extension.settings.deleteAllIdentities();
    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(0);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.uploadBackup({ backupFilePath: backupFilePath! });
    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(2);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Backup upload")).toBeVisible();
    await expect(extension.activity.getByText("Backup download")).toBeVisible();
  });

  test("should download and upload empty backup properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.deleteAllIdentities();
    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(0);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    const backupFilePath = await extension.settings.downloadBackup();
    expect(backupFilePath).toBeDefined();

    await extension.settings.openTab("Backup");
    await extension.settings.uploadBackup({ backupFilePath: backupFilePath! });
    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(0);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Backup upload")).toBeVisible();
    await expect(extension.activity.getByText("Backup download")).toBeVisible();
  });

  test("should download and upload backup with additional data properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth", identityType: "Random" });
    await expect(extension.getByText(/Account/)).toHaveCount(2);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    const backupFilePath = await extension.settings.downloadBackup();
    expect(backupFilePath).toBeDefined();

    await extension.goHome();

    await extension.identities.createIdentityFromHome({ walletType: "eth", identityType: "Random" });
    await expect(extension.getByText(/Account/)).toHaveCount(3);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.uploadBackup({ backupFilePath: backupFilePath! });
    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(3);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Backup upload")).toBeVisible();
    await expect(extension.activity.getByText("Backup download")).toBeVisible();
  });

  test("should double upload backup properly without data duplication", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth", identityType: "Random" });
    await extension.identities.createIdentityFromHome({ walletType: "eth", identityType: "Random" });
    await expect(extension.getByText(/Account/)).toHaveCount(3);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    const backupFilePath = await extension.settings.downloadBackup();
    expect(backupFilePath).toBeDefined();

    await extension.goHome();

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.uploadBackup({ backupFilePath: backupFilePath! });
    await extension.settings.uploadBackup({ backupFilePath: backupFilePath! });
    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(3);
  });
});
