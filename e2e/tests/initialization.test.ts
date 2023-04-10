import { expect, test } from "../fixtures";
import { connectWallet, createAccount, lockAccount, unlockAccount } from "../helpers/account";

test.describe("initialization", () => {
  test("should load demo and unlock account", async ({ app, cryptKeeper, cryptKeeperExtensionId, context }) => {
    await createAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });
    await lockAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });
    await unlockAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });

    await expect(app.getByTestId("home-page")).toBeVisible();

    await connectWallet({ app, cryptKeeper, cryptKeeperExtensionId, context });

    await expect(app.getByText("Ethereum mainnet")).toBeVisible();
  });
});
