import type { Page } from "@playwright/test";

import { CRYPT_KEEPER_PASSWORD } from "../constants";
import { type TestExtension, expect } from "../fixtures";
import { CryptKeeper } from "../pages";

interface ICreateAccountArgs extends TestExtension {
  password?: string;
  mnemonic?: string;
}

export async function createAccount({
  page,
  password = CRYPT_KEEPER_PASSWORD,
  mnemonic,
}: ICreateAccountArgs): Promise<void> {
  const cryptKeeper = await connectCryptKeeper(page);

  await cryptKeeper.createAccount({ password, mnemonic });
  await cryptKeeper.approve();
  await cryptKeeper.connectIdentity();

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

const RACE_TIMEOUT_MS = 5_000;

async function connectCryptKeeper(app: Page): Promise<CryptKeeper> {
  await app.waitForLoadState();
  await expect(app).toHaveTitle(/Crypt-keeper Extension demo/);
  await expect(app.getByText(/Please connect to Crypt-Keeper to continue./)).toBeVisible();

  const result = await Promise.race([
    app.context().waitForEvent("page"),
    new Promise((resolve) => {
      setTimeout(resolve, RACE_TIMEOUT_MS);
    }),
  ]);

  if (result) {
    return new CryptKeeper(result as Page);
  }

  const [popup] = await Promise.all([
    app.context().waitForEvent("page"),
    app.getByText("Connect", { exact: true }).click(),
  ]);

  return new CryptKeeper(popup);
}
