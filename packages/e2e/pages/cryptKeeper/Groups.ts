import type { Page } from "@playwright/test";

import BasePage from "../BasePage";

export default class Groups extends BasePage {
  async joinGroupRequest(): Promise<Page> {
    await this.page.getByText("Join test group").click({ delay: 1000 });
    return this.page.context().waitForEvent("page");
  }

  async joinGroup(): Promise<void> {
    const cryptKeeper = await this.joinGroupRequest();
    await cryptKeeper.getByText("Accept", { exact: true }).click({ delay: 1000 });
  }

  async generateGroupMerkleProofRequest(): Promise<Page> {
    await this.page.getByText("Generate Group Merkle Proof").click({ delay: 1000 });
    return this.page.context().waitForEvent("page");
  }

  async generateGroupMerkleProof(): Promise<void> {
    const cryptKeeper = await this.generateGroupMerkleProofRequest();

    await cryptKeeper.getByText("Accept", { exact: true }).click({ delay: 1000 });
  }
}
