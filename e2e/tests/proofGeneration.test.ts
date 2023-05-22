import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("proof generation", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Ethereum mainnet")).toBeVisible();

    const extension = new CryptKeeper(page);

    await extension.identitiesTab.createIdentity({ walletType: "eth" });
    await expect(extension.getByText("Account # 0")).toBeVisible();

    await page.goto("/");
  });

  test("should generate semaphore proof from merkle proof storage address", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof storage address").first().click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("Semaphore proof generated successfully!")).toBeVisible();
  });

  test("should generate semaphore proof from merkle proof artifacts", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof artifacts").first().click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("Semaphore proof generated successfully!")).toBeVisible();
  });

  test("should generate rln proof from merkle proof storage address", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof storage address").nth(1).click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("RLN proof generated successfully!")).toBeVisible();
  });

  test("should generate rln proof from merkle proof artifacts", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof artifacts").nth(1).click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("RLN proof generated successfully!")).toBeVisible();
  });
});
