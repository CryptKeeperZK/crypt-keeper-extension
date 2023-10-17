import { type Page } from "@playwright/test";

import BasePage from "../BasePage";

import Identities, { ICreateIdentityArgs } from "./Identities";

export default class ConnectIdentity extends BasePage {
  private identities: Identities;

  constructor(page: Page, identities: Identities) {
    super(page);
    this.identities = identities;
  }

  async createIdentity(params: ICreateIdentityArgs): Promise<ConnectIdentity> {
    await this.page.getByTestId("create-new-identity").click();

    if (!params.isImport) {
      await this.identities.createIdentity(params, this.page);
    } else {
      await this.page.getByTestId("import-identity").click();
      await this.identities.importIdentity({ name: "Account Zero", trapdoor: "0", nullifier: "0" }, this.page);
    }

    return this;
  }

  async selectIdentity(index = 0): Promise<ConnectIdentity> {
    await this.page
      .getByTestId(/identity-select-/)
      .nth(index)
      .click();

    await this.page.getByTestId("connect-identity").click();

    return this;
  }
}
