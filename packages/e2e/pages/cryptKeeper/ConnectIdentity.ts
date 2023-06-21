import type { Page } from "@playwright/test";

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
    await this.identities.createIdentity(this.page, params);

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
