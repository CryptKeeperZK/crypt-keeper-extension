import { DEMO_URL } from "../constants";
import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";

test.describe("reveal identity commitment", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Connected to MetaMask")).toBeVisible();

    await page.goto("/");
  });

  test("should reveal connected identity commitment properly [health-check]", async ({ page }) => {
    await page.getByTestId("reveal-connected-identity-commitment").click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByTestId("reveal-identity-commitment").click();

    await expect(page.getByTestId("commitment")).toBeVisible();
  });

  test("should reveal connected identity commitment from separate tab properly", async ({
    page,
    context,
    cryptKeeperExtensionId,
  }) => {
    const cryptKeeper = await context.newPage();
    await cryptKeeper.bringToFront();
    await cryptKeeper.goto(
      `chrome-extension://${cryptKeeperExtensionId}/popup.html#/reveal-identity-commitment?urlOrigin=${DEMO_URL}`,
    );
    await cryptKeeper.getByTestId("reveal-identity-commitment").click();

    await page.bringToFront();
    await expect(page.getByTestId("commitment")).toBeVisible();
  });

  test("should reveal connected identity commitment for several tabs properly", async ({
    page,
    context,
    cryptKeeperExtensionId,
  }) => {
    const demoApp = await context.newPage();
    await demoApp.goto("/");

    const cryptKeeper = await context.newPage();
    await cryptKeeper.bringToFront();
    await cryptKeeper.goto(
      `chrome-extension://${cryptKeeperExtensionId}/popup.html#/reveal-identity-commitment?urlOrigin=${DEMO_URL}`,
    );
    await cryptKeeper.getByTestId("reveal-identity-commitment").click();

    await page.bringToFront();
    await expect(page.getByTestId("commitment")).toBeVisible();

    await demoApp.bringToFront();
    await expect(demoApp.getByTestId("commitment")).toBeVisible();
  });
});
