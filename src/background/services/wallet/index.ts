import { Wallet } from "ethers";
import uniqBy from "lodash/uniqBy";

import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/background/services/crypto";
import LockerService from "@src/background/services/lock";
import MiscStorageService from "@src/background/services/misc";
import SimpleStorage from "@src/background/services/storage";
import { ISignMessageArgs, InitializationStep } from "@src/types";

import type { IAccount } from "./types";
import type { IBackupable } from "../backup";

const ACCOUNT_STORAGE_DB_KEY = "@ACCOUNT-STORAGE@";

export default class WalletService implements IBackupable {
  private static INSTANCE: WalletService;

  private accountStorage: SimpleStorage;

  private lockService: LockerService;

  private miscStorage: MiscStorageService;

  private constructor() {
    this.accountStorage = new SimpleStorage(ACCOUNT_STORAGE_DB_KEY);
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
    const rawData = await this.accountStorage.get<string>();

    const accounts: IAccount[] = rawData ? (JSON.parse(rawData) as IAccount[]) : [];
    accounts.push({ publicKey: wallet.publicKey, privateKey: wallet.privateKey, address: wallet.address });

    const encrypted = this.lockService.encrypt(JSON.stringify(accounts));
    await this.accountStorage.set(encrypted);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.MNEMONIC });
  };

  accounts = async (): Promise<string[]> => {
    const encrypted = await this.accountStorage.get<string>();
    const accounts = encrypted ? (JSON.parse(this.lockService.decrypt(encrypted)) as IAccount[]) : [];

    return accounts.map(({ address }) => address);
  };

  signMessage = async ({ message, address }: ISignMessageArgs): Promise<string> => {
    const encrypted = await this.accountStorage.get<string>();

    if (!encrypted) {
      throw new Error("No key pair available");
    }

    const accounts = JSON.parse(this.lockService.decrypt(encrypted)) as IAccount[];
    // TODO: remove condition when account for ck is done
    const account = accounts.find((item) => item.address === address) || accounts[0];

    // if (!account) {
    //   throw new Error(`There is no ${address} account`);
    // }

    const wallet = new Wallet(account.privateKey);

    return wallet.signMessage(message);
  };

  clear = async (): Promise<void> => {
    await this.accountStorage.clear();
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.accountStorage.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    await this.lockService.isAuthentic(backupPassword, Boolean(backupEncryptedData));

    if (backupEncryptedData) {
      const encrypted = await this.accountStorage.get<string>();
      const accounts = encrypted ? (JSON.parse(this.lockService.decrypt(encrypted)) as IAccount[]) : [];

      const authenticBackupCiphertext = cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword);
      const newAccounts = JSON.parse(this.lockService.decrypt(authenticBackupCiphertext)) as IAccount[];
      const mergedBackupData = this.lockService.encrypt(
        JSON.stringify(uniqBy([...accounts, ...newAccounts], "privateKey")),
      );

      await this.accountStorage.set(mergedBackupData);
    }
  };
}
