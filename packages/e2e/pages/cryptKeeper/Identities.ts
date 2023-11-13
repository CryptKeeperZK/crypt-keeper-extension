import { Page } from "@playwright/test";

import BasePage from "../BasePage";

type WalletType = "eth" | "ck";

export interface ICreateIdentityArgs {
  walletType: WalletType;
  nonce: number;
  isDeterministic: boolean;
  isImport?: boolean;
}

export interface IUpdateIdentityArgs {
  name: string;
}

export interface IImportIdentityArgs {
  name: string;
  walletType?: WalletType;
  trapdoor?: string;
  nullifier?: string;
}

export interface IImportIdentityWithFileArgs {
  name: string;
  filepath: string;
  walletType?: WalletType;
}

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

    await this.createIdentity(params);
  }

  async createIdentity(
    { nonce, walletType, isDeterministic }: ICreateIdentityArgs,
    page: Page | undefined = this.page,
  ): Promise<void> {
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

  async disconnect(index = 0): Promise<void> {
    const identities = await this.page.locator(`[data-testid="identity-row"]`).all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Disconnect").click();
    await this.page.getByText("Yes").click();
  }

  async goToImportIdentity(): Promise<void> {
    await this.page.getByTestId("create-new-identity").click();
    await this.page.getByTestId("import-identity").click();
  }

  async importIdentityWithFile({ name, filepath, walletType = "ck" }: IImportIdentityWithFileArgs): Promise<void> {
    await this.page.getByLabel("Name").fill(name);
    await this.page.setInputFiles(`input[name="file"]`, filepath);

    if (walletType === "eth") {
      await this.page.getByTestId("dropdown-menu-button").click();
      await this.page.getByTestId("dropdown-menu-item-1").click();
    }

    await this.page.getByTestId("dropdown-button").click();

    if (walletType === "eth") {
      const metamask = await this.page.context().waitForEvent("page");
      await metamask.getByTestId("page-container-footer-next").click();
    }
  }

  async importIdentity(
    { name, trapdoor, nullifier, walletType = "ck" }: IImportIdentityArgs,
    page: Page | undefined = this.page,
  ): Promise<void> {
    await page.getByLabel("Name").fill(name);

    if (trapdoor) {
      await page.getByLabel("Trapdoor").fill(trapdoor);
    }

    if (nullifier) {
      await page.getByLabel("Nullifier").fill(nullifier);
    }

    if (walletType === "eth") {
      await page.getByTestId("dropdown-menu-button").click();
      await page.getByTestId("dropdown-menu-item-1").click();
    }

    await page.getByTestId("dropdown-button").click();

    if (walletType === "eth") {
      const metamask = await page.context().waitForEvent("page");
      await metamask.getByTestId("page-container-footer-next").click();
    }
  }
}
