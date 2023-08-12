import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("identity", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Connected to MetaMask")).toBeVisible();
  });

  test("should create and delete different types of identities properly [health-check]", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth" });
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.identities.createIdentityFromHome({ provider: "Github", nonce: 0, walletType: "eth" });
    await expect(extension.getByText("Account # 1")).toBeVisible();

    await extension.identities.createIdentityFromHome({ provider: "Reddit", nonce: 0, walletType: "ck" });
    await expect(extension.getByText("Account # 2")).toBeVisible();

    await extension.identities.createIdentityFromHome({ identityType: "Random", nonce: 0, walletType: "eth" });
    await expect(extension.getByText("Account # 3")).toBeVisible();

    await extension.identities.createIdentityFromHome({ identityType: "Random", nonce: 0, walletType: "ck" });
    await expect(extension.getByText("Account # 4")).toBeVisible();

    await expect(extension.getByText(/Account/)).toHaveCount(6);

    await extension.identities.deleteIdentity(1);
    await expect(extension.getByText(/Account/)).toHaveCount(5);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.deleteAllIdentities();

    await extension.goHome();

    await expect(extension.getByText(/Account/)).toHaveCount(0);
  });

  test("should create and rename identity properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth" });
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.identities.renameIdentity(1, "My twitter identity");

    await expect(extension.getByText("My twitter identity")).toBeVisible();
  });

  test("should track activity create and delete operations properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth" });
    await expect(extension.getByText(/Account/)).toHaveCount(2);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Identity created")).toHaveCount(2);

    await extension.identities.openTab();
    await extension.identities.createIdentityFromHome({ walletType: "ck" });
    await expect(extension.getByText(/Account/)).toHaveCount(3);

    await extension.identities.deleteIdentity(1);
    await expect(extension.getByText(/Account/)).toHaveCount(2);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Identity removed")).toBeVisible();

    await extension.identities.openTab();
    await extension.identities.createIdentityFromHome({ walletType: "ck", identityType: "Random" });
    await expect(extension.getByText(/Account/)).toHaveCount(3);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.deleteAllIdentities();

    await extension.goHome();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("All identities removed")).toBeVisible();
  });

  test("should track activity clear operations properly", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await expect(extension.getByText(/Account/)).toHaveCount(1);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Identity created")).toHaveCount(1);

    await extension.settings.openPage();
    await extension.settings.openTab("Backup");
    await extension.settings.deleteAllIdentities();

    await extension.goHome();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("All identities removed")).toBeVisible();

    await extension.activity.deleteOperation();
    await extension.activity.deleteOperation();

    await expect(extension.activity.getByText("No records found")).toBeVisible();
  });

  test("should setup settings for tracking operations", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.settings.openPage();
    await extension.settings.toggleHistoryTracking();

    await extension.goHome();
    await expect(extension.getByText(/Account/)).toHaveCount(1);

    await extension.activity.openTab();
    await expect(extension.activity.getByText(/Identity created/)).toHaveCount(1);
    await extension.activity.deleteOperation();
    await expect(extension.activity.getByText("No records found")).toBeVisible();

    await extension.settings.openPage();
    await extension.settings.toggleHistoryTracking();

    await extension.goHome();
    await extension.identities.createIdentityFromHome({ walletType: "eth" });
    await expect(extension.getByText(/Account/)).toHaveCount(2);

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Identity created")).toBeVisible();

    await extension.settings.openPage();
    await extension.settings.clearHistory();

    await extension.goHome();
    await extension.activity.openTab();
    await expect(extension.activity.getByText("No records found")).toBeVisible();
  });

  test("should create identity from demo [health-check]", async ({ page, cryptKeeperExtensionId }) => {
    await page.goto("/");
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth", identityType: "Random" });
    await extension.identities.createIdentityFromHome({ walletType: "ck", identityType: "Random" });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(extension.getByText(/Account/)).toHaveCount(3);
  });

  test("should connect identity from demo [health-check]", async ({ page, cryptKeeperExtensionId }) => {
    await page.goto("/");
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth", identityType: "Random" });
    await extension.identities.createIdentityFromHome({ walletType: "ck", identityType: "Random" });

    await page.getByTestId("connect-identity").click({ delay: 1_000 });
    await extension.selectIdentity(1);

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(extension.getByText(/Account/)).toHaveCount(3);

    await extension.identities.deleteIdentity(0);

    await expect(extension.getByText(/Account/)).toHaveCount(2);
  });

  test("should check identity page [health-check]", async ({ page }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.identities.createIdentityFromHome({ walletType: "eth" });
    await expect(extension.getByText("Account # 1")).toBeVisible();

    await extension.identities.openIdentityPage(1);
    await extension.identities.updateIdentityFromPage({ name: "My new account" });
    await extension.goHome();

    await expect(extension.getByText("My new account")).toBeVisible();

    await extension.identities.openIdentityPage(1);
    await extension.identities.deleteIdentityFromPage();
    await extension.goHome();

    await expect(extension.getByText("My new account")).toBeHidden();
  });
});
