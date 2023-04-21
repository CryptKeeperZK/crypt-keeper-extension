import BasePage from "../BasePage";

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

export default class Identities extends BasePage {
  async openTab(): Promise<void> {
    await this.page.getByText("Identities", { exact: true }).click();
  }

  async createIdentity({ identityType, provider, nonce }: ICreateIdentityArgs | undefined = {}): Promise<void> {
    await this.page.getByText(/Add Identity/).click();

    const cryptKeeper = await this.page.context().waitForEvent("page");

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

  async renameIdentity(index: number, name: string): Promise<void> {
    const identities = await this.page.locator(".identity-row").all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Rename").click();

    await this.page.locator("#identityRename").fill(name);
    await this.page.locator("#identityRename").press("Enter");
  }

  async deleteIdentity(index = 0): Promise<void> {
    const identities = await this.page.locator(".identity-row").all();
    await identities[index].getByTestId("menu").click();

    await this.page.getByText("Delete").click();
    await this.page.getByText("Yes").click();
  }

  async deleteAllIdentities(): Promise<void> {
    await this.page.getByText("Clear all identities").click();
    await this.page.getByText("Yes").click();
  }
}
