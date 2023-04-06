import { expect, test } from "../fixtures";
import { createAccount, lockAccount, unlockAccount } from "../helpers/account";

test.describe("Initialization", () => {
  test("should load demo properly and create account", async ({
    app,
    cryptKeeper,
    cryptKeeperExtensionId,
    context,
  }) => {
    await createAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });
  });

  test("should load demo and unlock account", async ({ app, cryptKeeper, cryptKeeperExtensionId, context }) => {
    await createAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });
    await lockAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });
    await unlockAccount({ app, cryptKeeper, cryptKeeperExtensionId, context });

    await expect(app.getByTestId("home-page")).toBeVisible();
  });
});
