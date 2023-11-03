import type { Page } from "@playwright/test";

import BasePage from "../BasePage";

export default class Groups extends BasePage {
  async joinGroupRequest(): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.page.getByText("Join test group").click(),
    ]);

    return popup;
  }

  async joinGroup(): Promise<Page> {
    const cryptKeeper = await this.joinGroupRequest();
    await cryptKeeper.getByText("Accept", { exact: true }).click();

    return cryptKeeper;
  }

  async generateGroupMerkleProofRequest(): Promise<Page> {
    const [popup] = await Promise.all([
      this.page.context().waitForEvent("page"),
      this.page.getByText("Generate Group Merkle Proof").click(),
    ]);

    return popup;
  }

  async generateGroupMerkleProof(): Promise<void> {
    const cryptKeeper = await this.generateGroupMerkleProofRequest();

    await cryptKeeper.getByText("Accept", { exact: true }).click();
  }
}
