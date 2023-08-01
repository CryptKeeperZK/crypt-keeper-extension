import { CRYPT_KEEPER_PASSWORD, METAMASK_SEED_PHRASE } from "../constants";
import { expect, test } from "../fixtures";
import { createAccount, lockAccount, unlockAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("recover", () => {
  test("should recover access properly [health-check]", async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });
    await lockAccount({ page, cryptKeeperExtensionId, context });

    const extension = new CryptKeeper(page);
    await extension.focus();

    const mnemonic = await page.evaluate<string>("navigator.clipboard.readText()");
    const newPassword = `${CRYPT_KEEPER_PASSWORD}new`;

    await extension.recover.open();
    await extension.recover.checkMnemonic(mnemonic);
    await extension.recover.resetPassword(newPassword);

    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context, password: newPassword });

    await expect(page.getByTestId("home-page")).toBeVisible();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Password reset")).toHaveCount(1);
  });

  test("should recover access with user defined mnemonic properly", async ({
    page,
    cryptKeeperExtensionId,
    context,
  }) => {
    await createAccount({ page, cryptKeeperExtensionId, context, mnemonic: METAMASK_SEED_PHRASE });
    await lockAccount({ page, cryptKeeperExtensionId, context });

    const extension = new CryptKeeper(page);
    await extension.focus();

    const newPassword = `${CRYPT_KEEPER_PASSWORD}new`;

    await extension.recover.open();
    await extension.recover.checkMnemonic(METAMASK_SEED_PHRASE);
    await extension.recover.resetPassword(newPassword);

    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context, password: newPassword });

    await expect(page.getByTestId("home-page")).toBeVisible();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Password reset")).toHaveCount(1);

    await extension.settings.openPage();
    await extension.settings.openTab("Security");
    await extension.settings.goToRevealMnemonic();

    const revealedMnemonic = await extension.recover.getMnemonic(newPassword);

    expect(revealedMnemonic).toBe(METAMASK_SEED_PHRASE);
  });

  test("should change password properly [health-check]", async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });
    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);

    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.settings.openPage();
    await extension.settings.openTab("Security");
    await extension.settings.goToChangePassword();

    const mnemonic = await page.evaluate<string>("navigator.clipboard.readText()");
    const newPassword = `${CRYPT_KEEPER_PASSWORD}new`;

    await extension.recover.checkMnemonic(mnemonic);
    await extension.recover.resetPassword(newPassword);

    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context, password: newPassword });

    await expect(page.getByTestId("home-page")).toBeVisible();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Password reset")).toHaveCount(1);
  });

  test("should reveal mnemonic phrase properly [health-check]", async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });
    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);

    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.settings.openPage();
    await extension.settings.openTab("Security");
    await extension.settings.goToRevealMnemonic();

    const mnemonic = await page.evaluate<string>("navigator.clipboard.readText()");
    const revealedMnemonic = await extension.recover.getMnemonic(CRYPT_KEEPER_PASSWORD);

    expect(revealedMnemonic).toBe(mnemonic);
  });
});
