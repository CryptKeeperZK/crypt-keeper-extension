import * as metamaskCommands from "@synthetixio/synpress/commands/metamask";

import BasePage from "../BasePage";

import Activity from "./Activity";
import Identities from "./Identities";
import Settings from "./Settings";

export default class CryptKeeper extends BasePage {
  public activityTab = new Activity(this.page);

  public identitiesTab = new Identities(this.page);

  public settingsPage = new Settings(this.page);

  public async openPopup(extensionId: string): Promise<void> {
    await this.page.goto(`chrome-extension://${extensionId}/popup.html`);
  }

  public async goHome(): Promise<void> {
    await this.page.getByTestId("logo").click();
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
}
