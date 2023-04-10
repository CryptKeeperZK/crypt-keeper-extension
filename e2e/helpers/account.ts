import * as metamask from "@synthetixio/synpress/commands/metamask";

import type { Page } from "@playwright/test";

import { CRYPT_KEEPER_PASSWORD } from "../constants";
import { type TestExtension, expect } from "../fixtures";

export async function createAccount({ app, cryptKeeper }: TestExtension): Promise<void> {
  await connectCryptKeeper(app);

  await cryptKeeper.getByLabel("Password", { exact: true }).type(CRYPT_KEEPER_PASSWORD);
  await cryptKeeper.getByLabel("Confirm Password", { exact: true }).type(CRYPT_KEEPER_PASSWORD);
  await cryptKeeper.getByText("Continue", { exact: true }).click();

  await cryptKeeper.getByText("Approve").click();
}

export async function lockAccount({ app, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  await connectCryptKeeper(app);

  await app.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);

  await app.getByTestId("menu").click();
  await app.getByText("Lock", { exact: true }).click();
}

export async function connectWallet({ app, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  await app.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);

  await app.getByTestId("menu").click();
  await app.getByText("Connect wallet", { exact: true }).click();

  await metamask.acceptAccess();
}

export async function unlockAccount({ app, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  await app.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);

  await app.getByLabel("Password", { exact: true }).type(CRYPT_KEEPER_PASSWORD);
  await app.getByText("Unlock", { exact: true }).click();
}

async function connectCryptKeeper(app: Page): Promise<void> {
  await app.reload();
  await app.goto("/");

  await expect(app).toHaveTitle(/Crypt-keeper Extension demo/);
  await expect(app.getByText(/Please connect to Crypt-Keeper to continue./)).toBeVisible();
  await app.getByText("Connect", { exact: true }).click();
}
