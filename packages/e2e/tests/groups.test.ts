import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";
import { CryptKeeper } from "../pages";

test.describe("groups", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Connected to MetaMask")).toBeVisible();
  });

  test("should join group and proof the membership properly [health-check]", async ({
    page,
    cryptKeeperExtensionId,
  }) => {
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.groups.joinGroup();
    await expect(page.getByText(/User has joined the group./)).toBeVisible();

    await extension.groups.generateGroupMerkleProof();
    await expect(page.getByText("Group Merkle Proof has been successfully generated!")).toBeVisible();

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await extension.activity.openTab();

    await expect(extension.getByTestId(/group/)).toHaveCount(1);
    await expect(extension.getByText(/Joined group/)).toHaveCount(1);
  });

  test("should display already joined screen for join group", async ({ page }) => {
    await page.goto("/");
    const extension = new CryptKeeper(page);
    await extension.focus();

    await extension.groups.joinGroup();
    const popup = await extension.groups.joinGroupRequest();
    await expect(popup.getByTestId("joined-text")).toBeVisible();

    await popup.getByText("Reject", { exact: true }).click();
  });

  test("should display not joined screen for group merkle proof generation", async ({ page }) => {
    await page.goto("/");
    const extension = new CryptKeeper(page);
    await extension.focus();

    const popup = await extension.groups.generateGroupMerkleProofRequest();
    await expect(popup.getByTestId("not-joined-text")).toBeVisible();

    await popup.getByText("Reject", { exact: true }).click();
  });
});
