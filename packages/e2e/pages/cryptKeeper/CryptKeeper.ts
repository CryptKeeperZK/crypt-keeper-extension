import * as metamaskCommands from "@synthetixio/synpress/commands/metamask";

import BasePage from "../BasePage";

import Activity from "./Activity";
import ConnectIdentity from "./ConnectIdentity";
import Groups from "./Groups";
import Identities from "./Identities";
import Recover from "./Recover";
import Settings from "./Settings";

interface ICreateAccountArgs {
  password: string;
  confirmPassword?: string;
  mnemonic?: string;
}

interface ICreateAccountFromBackupArgs {
  password: string;
  backupFilePath: string;
}

export default class CryptKeeper extends BasePage {
  activity = new Activity(this.page);

  identities = new Identities(this.page);

  recover = new Recover(this.page);

  settings = new Settings(this.page);

  groups = new Groups(this.page);

  async openPopup(extensionId: string): Promise<void> {
    await this.page.goto(`chrome-extension://${extensionId}/popup.html`);
  }

  async goHome(): Promise<void> {
    await this.page.getByTestId("logo").click();
  }

  async unlock(password: string): Promise<void> {
    await this.page.getByLabel("Password", { exact: true }).type(password);
    await this.page.getByText("Unlock", { exact: true }).click();
  }

  async lock(): Promise<void> {
    await this.page.getByTestId("menu").first().click();
    await this.page.getByText("Lock", { exact: true }).click();
  }

  async connectWallet(): Promise<void> {
    await this.page.waitForSelector(`[data-testid="home-info"]`);
    const isMetamaskConnected = await this.page.getByText("Connected to MetaMask").isVisible();

    if (isMetamaskConnected) {
      return;
    }

    await this.page.getByTestId("menu").first().click();
    await this.page.getByText("Connect MetaMask", { exact: true }).click();
    await metamaskCommands.acceptAccess();
  }

  async createAccount({ password, confirmPassword = password, mnemonic }: ICreateAccountArgs): Promise<void> {
    await this.page.getByLabel("Password", { exact: true }).type(password);
    await this.page.getByLabel("Confirm Password", { exact: true }).type(confirmPassword);
    await this.page.getByText("Continue", { exact: true }).click();

    if (!mnemonic) {
      await this.page.getByText("Copy").click();
    }

    if (mnemonic) {
      await this.page.getByTestId("change-mode-button").click();
      await this.page.getByTestId("mnemonic-input").locator("textarea").first().type(mnemonic);
    }

    await this.page.getByText("Get started!", { exact: true }).click();
  }

  async openBackupOnboarding(): Promise<void> {
    await this.page.getByText("Have backup?", { exact: true }).click();
  }

  async createAccountFromBackup({ password, backupFilePath }: ICreateAccountFromBackupArgs): Promise<void> {
    await this.page.setInputFiles(`input[name="backupFile"]`, backupFilePath);
    await this.page.getByLabel("Backup password", { exact: true }).fill(password);

    await this.page.getByText("Upload", { exact: true }).click();
  }

  async approve(): Promise<void> {
    await this.page.getByText("Approve").click();
  }

  async connectIdentity(index = 0): Promise<void> {
    const cryptKeeper = await this.page.context().waitForEvent("page");

    await new ConnectIdentity(cryptKeeper, this.identities)
      .createIdentity({ walletType: "ck", nonce: 0, isDeterministic: false })
      .then((page) => page.selectIdentity(index));
  }

  async selectIdentity(index = 0): Promise<void> {
    const cryptKeeper = await this.page.context().waitForEvent("page");

    await new ConnectIdentity(cryptKeeper, this.identities).selectIdentity(index);
  }
}
