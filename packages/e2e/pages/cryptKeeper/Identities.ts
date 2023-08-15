import { Page } from "@playwright/test";

import BasePage from "../BasePage";

export interface ICreateIdentityArgs {
  walletType: WalletType;
  identityType?: IdentityType;
  provider?: ProviderType;
  nonce?: number;
}

export interface IUpdateIdentityArgs {
  name: string;
}

type WalletType = "eth" | "ck";

type IdentityType = "InterRep" | "Random";

type ProviderType = "Twitter" | "Reddit" | "Github";

const IDENTITY_OPTIONS: Record<IdentityType, number> = {
  InterRep: 0,
  Random: 1,
};

const PROVIDER_OPTIONS: Record<ProviderType, number> = {
  Twitter: 0,
  Github: 1,
  Reddit: 2,
};

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
    const cryptKeeper = await this.page.context().waitForEvent("page");

    await this.createIdentity(cryptKeeper, params);
  }

  async createIdentity(page: Page, { identityType, provider, nonce, walletType }: ICreateIdentityArgs): Promise<void> {
    if (identityType) {
      await page.locator("#identityStrategyType").click();
      await page.locator(`[id$="-option-${IDENTITY_OPTIONS[identityType]}"]`).click();
    }

    if (provider && identityType !== "Random") {
      await page.locator("#web2Provider").click();
      await page.locator(`[id$="-option-${PROVIDER_OPTIONS[provider]}"]`).click();
    }

    if (nonce && identityType !== "Random") {
      await page.getByLabel("Nonce").fill(nonce.toString());
    }

    await page.getByRole("button", { name: walletType === "eth" ? "Metamask" : "Cryptkeeper" }).click();

    if (walletType === "eth") {
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
