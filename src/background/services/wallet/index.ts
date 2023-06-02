import { Wallet } from "ethers";
import uniqBy from "lodash/uniqBy";

import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/background/services/crypto";
import LockerService from "@src/background/services/lock";
import MiscStorageService from "@src/background/services/misc";
import { generateMnemonic } from "@src/background/services/mnemonic";
import SimpleStorage from "@src/background/services/storage";
import { ISignMessageArgs, InitializationStep } from "@src/types";
import { setSelectedAccount } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { IAccount } from "./types";
import type { IBackupable } from "../backup";

const ACCOUNT_STORAGE_DB_KEY = "@ACCOUNT-STORAGE@";
const MNEMONIC_STORAGE_DB_KEY = "@MNEMONIC-STORAGE@";
const SELECTED_ACCOUNT_STORAGE_DB_KEY = "@SELECTED-ACCOUNT-STORAGE@";

export default class WalletService implements IBackupable {
  private static INSTANCE: WalletService;

  private accountStorage: SimpleStorage;

  private selectedAccountStorage: SimpleStorage;

  private mnemonicStorage: SimpleStorage;

  private lockService: LockerService;

  private miscStorage: MiscStorageService;

  private constructor() {
    this.accountStorage = new SimpleStorage(ACCOUNT_STORAGE_DB_KEY);
    this.mnemonicStorage = new SimpleStorage(MNEMONIC_STORAGE_DB_KEY);
    this.selectedAccountStorage = new SimpleStorage(SELECTED_ACCOUNT_STORAGE_DB_KEY);
    this.lockService = LockerService.getInstance();
    this.miscStorage = MiscStorageService.getInstance();
  }

  static getInstance = (): WalletService => {
    if (!WalletService.INSTANCE) {
      WalletService.INSTANCE = new WalletService();
    }

    return WalletService.INSTANCE;
  };

  generateMnemonic = async (): Promise<string> => {
    const accounts = await this.accountStorage.get<string>();

    if (accounts) {
      throw new Error("Key pair is already generated");
    }

    const encryptedMnemonic = await this.mnemonicStorage.get<string>();

    if (encryptedMnemonic) {
      return this.lockService.decrypt(encryptedMnemonic);
    }

    const mnemonic = generateMnemonic();
    const encrypted = this.lockService.encrypt(mnemonic);
    await this.mnemonicStorage.set(encrypted);

    return mnemonic;
  };

  generateKeyPair = async (): Promise<void> => {
    const encryptedMnemonic = await this.mnemonicStorage.get<string>();

    if (!encryptedMnemonic) {
      throw new Error("Generate mnemonic first");
    }

    const mnemonic = this.lockService.decrypt(encryptedMnemonic);
    const wallet = Wallet.fromPhrase(mnemonic);
    const rawData = await this.accountStorage.get<string>();

    const accounts: IAccount[] = rawData ? (JSON.parse(rawData) as IAccount[]) : [];
    accounts.push({ publicKey: wallet.publicKey, privateKey: wallet.privateKey, address: wallet.address });

    const encrypted = this.lockService.encrypt(JSON.stringify(accounts));
    await this.accountStorage.set(encrypted);
    await this.selectAccount(wallet.address);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.MNEMONIC });
    await this.mnemonicStorage.clear();
  };

  selectAccount = async (address: string): Promise<string> => {
    if (!address) {
      throw new Error("No address provided");
    }

    const encryptedAccounts = await this.accountStorage.get<string>();
    const accounts = encryptedAccounts ? (JSON.parse(this.lockService.decrypt(encryptedAccounts)) as IAccount[]) : [];
    const isFound = accounts.some((account) => account.address.toLowerCase() === address.toLowerCase());

    if (!isFound) {
      throw new Error(`Account ${address} not found`);
    }

    const encrypted = this.lockService.encrypt(address.toLowerCase());
    await this.selectedAccountStorage.set(encrypted);
    await pushMessage(setSelectedAccount(address.toLowerCase()));

    return address.toLowerCase();
  };

  getSelectedAccount = async (): Promise<string | null> => {
    const encryped = await this.selectedAccountStorage.get<string>();
    return encryped && this.lockService.decrypt(encryped);
  };

  accounts = async (): Promise<string[]> => {
    const encryptedAccounts = await this.accountStorage.get<string>();
    const accounts = encryptedAccounts ? (JSON.parse(this.lockService.decrypt(encryptedAccounts)) as IAccount[]) : [];
    const selectedAddress = await this.getSelectedAccount();
    const addresses = accounts.map(({ address }) => address.toLowerCase());

    return selectedAddress
      ? [selectedAddress.toLowerCase()].concat(addresses.filter((address) => address !== selectedAddress.toLowerCase()))
      : addresses;
  };

  signMessage = async ({ message, address }: ISignMessageArgs): Promise<string> => {
    const encrypted = await this.accountStorage.get<string>();

    if (!encrypted) {
      throw new Error("No key pair available");
    }

    const accounts = JSON.parse(this.lockService.decrypt(encrypted)) as IAccount[];
    const account = accounts.find((item) => item.address.toLowerCase() === address.toLowerCase());

    if (!account) {
      throw new Error(`There is no ${address} account`);
    }

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
