import type { Page } from "@playwright/test";

import { CRYPT_KEEPER_PASSWORD } from "../constants";
import { type TestExtension, expect } from "../fixtures";
import { CryptKeeper } from "../pages";

interface ICreateAccountArgs extends TestExtension {
  password?: string;
  mnemonic?: string;
  isImport?: boolean;
}

export async function createAccount({
  page,
  password = CRYPT_KEEPER_PASSWORD,
  mnemonic,
  isImport = false,
}: ICreateAccountArgs): Promise<void> {
  const cryptKeeper = await connectCryptKeeper(page);

  await cryptKeeper.createAccount({ password, mnemonic });
  await cryptKeeper.approve();
  await cryptKeeper.connectIdentity(0, isImport);

  await cryptKeeper.close();
}

export async function lockAccount({ page, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  const cryptKeeper = new CryptKeeper(page);
  await cryptKeeper.openPopup(cryptKeeperExtensionId);

  await cryptKeeper.lock();
}

export async function connectWallet({ page, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  const cryptKeeper = new CryptKeeper(page);
  await cryptKeeper.openPopup(cryptKeeperExtensionId);

  await cryptKeeper.connectWallet();
}

interface IUnlockAccountArgs extends TestExtension {
  password?: string;
}

export async function unlockAccount({
  page,
  cryptKeeperExtensionId,
  password = CRYPT_KEEPER_PASSWORD,
}: IUnlockAccountArgs): Promise<void> {
  const cryptKeeper = new CryptKeeper(page);
  await cryptKeeper.openPopup(cryptKeeperExtensionId);

  await cryptKeeper.unlock(password);
}

export async function connectCryptKeeper(app: Page): Promise<CryptKeeper> {
  await app.waitForLoadState();
  await expect(app).toHaveTitle(/CryptKeeper Extension demo/);
  await expect(app.getByText(/Welcome to CryptKeeper Demo!/)).toBeVisible();
  await expect(app.getByText(/To continue, please connect to your CryptKeeper to continue./)).toBeVisible();

  const [popup] = await Promise.all([
    app.context().waitForEvent("page"),
    app.getByText("Connect Identity", { exact: true }).click(),
  ]);

  return new CryptKeeper(popup);
}
