import * as metamaskCommands from "@synthetixio/synpress/commands/metamask";

import BasePage from "./BasePage";

export interface ICreateIdentityArgs {
  identityType?: IdentityType;
  provider?: ProviderType;
  nonce?: number;
}

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

export default class CryptKeeper extends BasePage {
  public async openPopup(extensionId: string): Promise<void> {
    await this.page.goto(`chrome-extension://${extensionId}/popup.html`);
  }

  public async unlock(password: string): Promise<void> {
    await this.page.getByLabel("Password", { exact: true }).type(password);
    await this.page.getByText("Unlock", { exact: true }).click();
  }

  public async lock(): Promise<void> {
    await this.page.getByTestId("menu").click();
    await this.page.getByText("Lock", { exact: true }).click();
  }

  public async connectWallet(): Promise<void> {
    await this.page.getByTestId("menu").click();
    await this.page.getByText("Connect wallet", { exact: true }).click();

    await metamaskCommands.acceptAccess();
  }

  public async createAccount(password: string, confirmPassword?: string): Promise<void> {
    await this.page.getByLabel("Password", { exact: true }).type(password);
    await this.page.getByLabel("Confirm Password", { exact: true }).type(confirmPassword ?? password);
    await this.page.getByText("Continue", { exact: true }).click();
  }

  public async approve(): Promise<void> {
    await this.page.getByText("Approve").click();
  }

  public async createIdentity({ identityType, provider, nonce }: ICreateIdentityArgs | undefined = {}): Promise<void> {
    const [cryptKeeper] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.page.getByText(/Add Identity/).click(),
    ]);

    if (identityType) {
      await cryptKeeper.locator("#identityStrategyType").click();
      await cryptKeeper.locator(`[id$="-option-${IDENTITY_OPTIONS[identityType]}"]`).click();
    }

    if (provider && identityType !== "Random") {
      await cryptKeeper.locator("#web2Provider").click();
      await cryptKeeper.locator(`[id$="-option-${PROVIDER_OPTIONS[provider]}"]`).click();
    }

    if (nonce && identityType !== "Random") {
      await cryptKeeper.getByLabel("Nonce").fill(nonce.toString());
    }
    await cryptKeeper.getByRole("button", { name: "Create" }).click();

    // TODO: synpress doesn't support new data-testid for metamask
    const metamask = await this.page.context().waitForEvent("page");
    await metamask.getByTestId("page-container-footer-next").click();
  }

  public async renameIdentity(index: number, name: string): Promise<void> {
    const identities = await this.page.locator(".identity-row").all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Rename").click();

    await this.page.locator("#identityRename").fill(name);
    await this.page.locator("#identityRename").press("Enter");
  }

  public async deleteIdentity(index: number): Promise<void> {
    const identities = await this.page.locator(".identity-row").all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Delete").click();
    await this.page.getByText("Yes").click();
  }

  public async deleteAllIdentities(): Promise<void> {
    await this.page.getByText("Clear all identities").click();
    await this.page.getByText("Yes").click();
  }
}
