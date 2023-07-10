import { CRYPT_KEEPER_PASSWORD } from "../constants";
import { expect, test } from "../fixtures";
import { createAccount, lockAccount, unlockAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("recover", () => {
  test("should recover access properly", async ({ page, cryptKeeperExtensionId, context }) => {
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
    await unlockAccount({ page, cryptKeeperExtensionId, context }, newPassword);

    await expect(page.getByTestId("home-page")).toBeVisible();

    await extension.activity.openTab();
    await expect(extension.activity.getByText("Password reset")).toHaveCount(1);
  });
});
