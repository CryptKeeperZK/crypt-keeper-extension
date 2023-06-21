import { expect, test } from "../fixtures";
import { connectWallet, createAccount, lockAccount, unlockAccount } from "../helpers/account";

test.describe("initialization", () => {
  test("should load demo and unlock account", async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });
    await lockAccount({ page, cryptKeeperExtensionId, context });
    await unlockAccount({ page, cryptKeeperExtensionId, context });

    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });

    await expect(page.getByText("Connected to Metamask")).toBeVisible();
  });
});
