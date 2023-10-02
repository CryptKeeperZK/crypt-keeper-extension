import { Page } from "@playwright/test";

import BasePage from "../BasePage";

export interface ICreateIdentityArgs {
  walletType: WalletType;
  nonce: number;
  isDeterministic: boolean;
}

export interface IUpdateIdentityArgs {
  name: string;
}

type WalletType = "eth" | "ck";

export default class Identities extends BasePage {
  async openTab(): Promise<void> {
    await this.page.getByText("Identities", { exact: true }).click();
  }

  async openIdentityPage(index = 0): Promise<void> {
    const identities = await this.page.locator(`[data-testid="identity-row"]`).all();
    await identities[index].getByTestId("menu").click();
    await this.page.getByText("View").click();
  }

  async updateIdentityFromPage({ name }: IUpdateIdentityArgs): Promise<void> {
    await this.page.getByText("Update").click();

    await this.page.locator("#identityRename").fill(name);
    await this.page.locator("#identityRename").press("Enter");
  }

  async deleteIdentityFromPage(): Promise<void> {
    await this.page.getByText("Delete").click();
    await this.page.getByText("Yes").click();
  }

  async createIdentityFromHome(params: ICreateIdentityArgs): Promise<void> {
    await this.page.getByTestId("create-new-identity").click({ delay: 1000 });

    await this.createIdentity(this.page, params);
  }

  async createIdentityFromDemo(params: ICreateIdentityArgs): Promise<void> {
    await this.page.getByTestId("create-new-identity").click({ delay: 1000 });
    const cryptKeeper = await this.page.context().waitForEvent("page");

    await this.createIdentity(cryptKeeper, params);
  }

  async createIdentity(page: Page, { nonce, walletType, isDeterministic }: ICreateIdentityArgs): Promise<void> {
    await page.getByLabel("Nonce", { exact: true }).fill(nonce.toString());

    const deterministicCheckbox = page.getByLabel("Deterministic identity", { exact: true });
    const isDeterministicEnabled = await deterministicCheckbox.isChecked();

    if (isDeterministic !== isDeterministicEnabled) {
      await deterministicCheckbox.click();
    }

    if (walletType === "eth") {
      await page.getByTestId("dropdown-menu-button").click();
      await page.getByTestId("dropdown-menu-item-1").click();
    }

    await page.getByTestId("dropdown-button").click();

    if (walletType === "eth" && isDeterministic) {
      // TODO: synpress doesn't support new data-testid for metamask
      const metamask = await this.page.context().waitForEvent("page");

      await metamask.getByTestId("page-container-footer-next").click();
    }
  }

  async renameIdentity(index: number, name: string): Promise<void> {
    const identities = await this.page.locator(`[data-testid="identity-row"]`).all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Rename").click();

    await this.page.locator("#identityRename").fill(name);
    await this.page.locator("#identityRename").press("Enter");
  }

  async deleteIdentity(index = 0): Promise<void> {
    const identities = await this.page.locator(`[data-testid="identity-row"]`).all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Delete").click();
    await this.page.getByText("Yes").click();
  }
}
