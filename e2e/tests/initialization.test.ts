import { expect, test } from "../fixtures";
import { connectWallet, createAccount, lockAccount, unlockAccount } from "../helpers/account";

test.describe("initialization", () => {
  test("should load demo and unlock account", async ({ app, cryptKeeperExtensionId, context }) => {
    await createAccount({ app, cryptKeeperExtensionId, context });
    await lockAccount({ app, cryptKeeperExtensionId, context });
    await unlockAccount({ app, cryptKeeperExtensionId, context });

    await expect(app.getByTestId("home-page")).toBeVisible();

    await connectWallet({ app, cryptKeeperExtensionId, context });

    await expect(app.getByText("Ethereum mainnet")).toBeVisible();
  });
});
