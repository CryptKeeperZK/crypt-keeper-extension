import { Wallet } from "ethers";

import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/background/services/crypto";
import LockerService from "@src/background/services/lock";
import MiscStorageService from "@src/background/services/misc";
import SimpleStorage from "@src/background/services/storage";
import { InitializationStep } from "@src/types";

import type { KeyPair } from "./types";
import type { IBackupable } from "../backup";

const KEY_STORAGE_DB_KEY = "@KEY-STORAGE@";

export default class WalletService implements IBackupable {
  private static INSTANCE: WalletService;

  private keyStorage: SimpleStorage;

  private lockService: LockerService;

  private miscStorage: MiscStorageService;

  private constructor() {
    this.keyStorage = new SimpleStorage(KEY_STORAGE_DB_KEY);
    this.lockService = LockerService.getInstance();
    this.miscStorage = MiscStorageService.getInstance();
  }

  static getInstance = (): WalletService => {
    if (!WalletService.INSTANCE) {
      WalletService.INSTANCE = new WalletService();
    }

    return WalletService.INSTANCE;
  };

  generateKeyPair = async (mnemonic: string): Promise<void> => {
    const wallet = Wallet.fromPhrase(mnemonic);

    const serializedKeys = JSON.stringify({
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    });
    const encrypted = this.lockService.encrypt(serializedKeys);
    await this.keyStorage.set(encrypted);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.MNEMONIC });
  };

  signMessage = async (message: string): Promise<string> => {
    const encrypted = await this.keyStorage.get<string>();

    if (!encrypted) {
      throw new Error("No key pair available");
    }

    const { privateKey } = JSON.parse(this.lockService.decrypt(encrypted)) as KeyPair;
    const wallet = new Wallet(privateKey);

    return wallet.signMessage(message);
  };

  clear = async (): Promise<void> => {
    await this.keyStorage.clear();
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.keyStorage.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    const { isNewOnboarding } = await this.lockService.isAuthentic(backupPassword, Boolean(backupEncryptedData));

    if (isNewOnboarding && backupEncryptedData) {
      const authenticBackupCiphertext = cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword);
      await this.keyStorage.set(authenticBackupCiphertext);
    }
  };
}
