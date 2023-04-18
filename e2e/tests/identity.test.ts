import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("identity", () => {
  test.beforeEach(async ({ app, cryptKeeperExtensionId, context }) => {
    await createAccount({ app, cryptKeeperExtensionId, context });

    await app.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(app.getByTestId("home-page")).toBeVisible();

    await connectWallet({ app, cryptKeeperExtensionId, context });
    await expect(app.getByText("Ethereum mainnet")).toBeVisible();
  });

  test("should create and delete different types of identities properly", async ({ app }) => {
    const extension = new CryptKeeper(app);
    await extension.focus();

    await extension.createIdentity();
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.createIdentity({ provider: "Github", nonce: 0 });
    await expect(extension.getByText("Account # 1")).toBeVisible();

    await extension.createIdentity({ provider: "Reddit", nonce: 0 });
    await expect(extension.getByText("Account # 2")).toBeVisible();

    await extension.createIdentity({ identityType: "Random", nonce: 0 });
    await expect(extension.getByText("Account # 3")).toBeVisible();

    await extension.createIdentity({ identityType: "Random", nonce: 0 });
    await expect(extension.getByText("Account # 4")).toBeVisible();

    await expect(extension.getByText(/Account/)).toHaveCount(5);

    await extension.deleteIdentity(0);
    await expect(extension.getByText(/Account/)).toHaveCount(4);

    await extension.deleteAllIdentities();
    await expect(extension.getByText(/Account/)).toHaveCount(0);
  });

  test("should create and rename identity properly", async ({ app }) => {
    const extension = new CryptKeeper(app);
    await extension.focus();

    await extension.createIdentity();
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await extension.renameIdentity(0, "My twitter identity");

    await expect(extension.getByText("My twitter identity")).toBeVisible();
  });
});
