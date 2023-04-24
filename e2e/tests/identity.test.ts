import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("identity", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Ethereum mainnet")).toBeVisible();
  });

  test("should create and delete different types of identities properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identitiesTab.createIdentity();
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.identitiesTab.createIdentity({ provider: "Github", nonce: 0 });
    await expect(extension.getByText("Account # 1")).toBeVisible();

    await extension.identitiesTab.createIdentity({ provider: "Reddit", nonce: 0 });
    await expect(extension.getByText("Account # 2")).toBeVisible();

    await extension.identitiesTab.createIdentity({ identityType: "Random", nonce: 0 });
    await expect(extension.getByText("Account # 3")).toBeVisible();

    await extension.identitiesTab.createIdentity({ identityType: "Random", nonce: 0 });
    await expect(extension.getByText("Account # 4")).toBeVisible();

    await expect(extension.getByText(/Account/)).toHaveCount(5);

    await extension.identitiesTab.deleteIdentity(0);
    await expect(extension.getByText(/Account/)).toHaveCount(4);

    await extension.identitiesTab.deleteAllIdentities();
    await expect(extension.getByText(/Account/)).toHaveCount(0);
  });

  test("should create and rename identity properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identitiesTab.createIdentity();
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.identitiesTab.renameIdentity(0, "My twitter identity");

    await expect(extension.getByText("My twitter identity")).toBeVisible();
  });

  test("should track activity create and delete operations properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identitiesTab.createIdentity();
    await expect(extension.getByText(/Account/)).toHaveCount(1);

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("Identity created")).toBeVisible();

    await extension.identitiesTab.openTab();
    await extension.identitiesTab.deleteIdentity(0);
    await expect(extension.getByText(/Account/)).toHaveCount(0);

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("Identity removed")).toBeVisible();

    await extension.identitiesTab.openTab();
    await extension.identitiesTab.createIdentity();
    await expect(extension.getByText(/Account/)).toHaveCount(1);

    await extension.identitiesTab.deleteAllIdentities();

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("All identities removed")).toBeVisible();
  });

  test("should track activity clear operations properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identitiesTab.createIdentity();
    await expect(extension.getByText(/Account/)).toHaveCount(1);

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("Identity created")).toBeVisible();

    await extension.identitiesTab.openTab();
    await extension.identitiesTab.deleteIdentity(0);
    await expect(extension.getByText(/Account/)).toHaveCount(0);

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("Identity removed")).toBeVisible();

    await extension.activityTab.deleteOperation();
    await extension.activityTab.deleteOperation();

    await expect(extension.activityTab.getByText("No records found")).toBeVisible();
  });

  test("should setup settings for tracking operations", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.settingsPage.openPage();
    await extension.settingsPage.toggleHistoryTracking();

    await extension.goHome();
    await extension.identitiesTab.createIdentity();
    await expect(extension.getByText(/Account/)).toHaveCount(1);

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("No records found")).toBeVisible();

    await extension.settingsPage.openPage();
    await extension.settingsPage.toggleHistoryTracking();

    await extension.goHome();
    await extension.identitiesTab.deleteIdentity();
    await expect(extension.getByText(/Account/)).toHaveCount(0);

    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("Identity removed")).toBeVisible();

    await extension.settingsPage.openPage();
    await extension.settingsPage.clearHistory();

    await extension.goHome();
    await extension.activityTab.openTab();
    await expect(extension.activityTab.getByText("No records found")).toBeVisible();
  });
});
