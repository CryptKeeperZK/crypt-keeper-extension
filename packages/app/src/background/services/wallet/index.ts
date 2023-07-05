import { Wallet } from "ethers";
import uniqBy from "lodash/uniqBy";

import CryptoService from "@src/background/services/crypto";
import MiscStorageService from "@src/background/services/misc";
import { generateMnemonic, validateMnemonic } from "@src/background/services/mnemonic";
import SimpleStorage from "@src/background/services/storage";
import { ICheckMnemonicArgs, ISignMessageArgs, InitializationStep } from "@src/types";
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

  private miscStorage: MiscStorageService;

  private cryptoService: CryptoService;

  private constructor() {
    this.accountStorage = new SimpleStorage(ACCOUNT_STORAGE_DB_KEY);
    this.mnemonicStorage = new SimpleStorage(MNEMONIC_STORAGE_DB_KEY);
    this.selectedAccountStorage = new SimpleStorage(SELECTED_ACCOUNT_STORAGE_DB_KEY);
    this.miscStorage = MiscStorageService.getInstance();
    this.cryptoService = CryptoService.getInstance();
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
      return this.cryptoService.decrypt(encryptedMnemonic);
    }

    const mnemonic = generateMnemonic();
    const encrypted = this.cryptoService.encrypt(mnemonic);
    await this.mnemonicStorage.set(encrypted);

    return mnemonic;
  };

  generateKeyPair = async (): Promise<void> => {
    const encryptedMnemonic = await this.mnemonicStorage.get<string>();

    if (!encryptedMnemonic) {
      throw new Error("Generate mnemonic first");
    }

    const mnemonic = this.cryptoService.decrypt(encryptedMnemonic);
    const wallet = Wallet.fromPhrase(mnemonic);
    const rawData = await this.accountStorage.get<string>();

    const accounts: IAccount[] = rawData ? (JSON.parse(rawData) as IAccount[]) : [];
    accounts.push({ publicKey: wallet.publicKey, privateKey: wallet.privateKey, address: wallet.address });

    const encrypted = this.cryptoService.encrypt(JSON.stringify(accounts));
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
    const accounts = encryptedAccounts ? (JSON.parse(this.cryptoService.decrypt(encryptedAccounts)) as IAccount[]) : [];
    const isFound = accounts.some((account) => account.address.toLowerCase() === address.toLowerCase());

    if (!isFound) {
      throw new Error(`Account ${address} not found`);
    }

    const encrypted = this.cryptoService.encrypt(address.toLowerCase());
    await this.selectedAccountStorage.set(encrypted);
    await pushMessage(setSelectedAccount(address.toLowerCase()));

    return address.toLowerCase();
  };

  getSelectedAccount = async (): Promise<string | null> => {
    const encryped = await this.selectedAccountStorage.get<string>();
    return encryped && this.cryptoService.decrypt(encryped);
  };

  accounts = async (): Promise<string[]> => {
    const encryptedAccounts = await this.accountStorage.get<string>();
    const accounts = encryptedAccounts ? (JSON.parse(this.cryptoService.decrypt(encryptedAccounts)) as IAccount[]) : [];
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

    const accounts = JSON.parse(this.cryptoService.decrypt(encrypted)) as IAccount[];
    const account = accounts.find((item) => item.address.toLowerCase() === address.toLowerCase());

    if (!account) {
      throw new Error(`There is no ${address} account`);
    }

    const wallet = new Wallet(account.privateKey);

    return wallet.signMessage(message);
  };

  checkMnemonic = async ({ mnemonic, strict = true }: ICheckMnemonicArgs): Promise<boolean> => {
    if (!validateMnemonic(mnemonic)) {
      throw new Error("Mnemonic is invalid");
    }

    const wallet = Wallet.fromPhrase(mnemonic);
    const encrypted = await this.accountStorage.get<string>();
    const accounts = encrypted ? (JSON.parse(this.cryptoService.decrypt(encrypted)) as IAccount[]) : [];

    const hasDerivedAccounts = accounts.some(
      (account) => account.privateKey.toLowerCase() === wallet.privateKey.toLowerCase(),
    );

    if (!hasDerivedAccounts && strict) {
      throw new Error("Unknown mnemonic");
    }

    return hasDerivedAccounts;
  };

  clear = async (): Promise<void> => {
    await this.accountStorage.clear();
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.accountStorage.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    return this.cryptoService.generateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    if (backupEncryptedData) {
      const encrypted = await this.accountStorage.get<string>();
      const accounts = encrypted ? (JSON.parse(this.cryptoService.decrypt(encrypted)) as IAccount[]) : [];

      const authenticBackupCiphertext = this.cryptoService.getAuthenticCiphertext(backupEncryptedData, backupPassword);
      const newAccounts = JSON.parse(this.cryptoService.decrypt(authenticBackupCiphertext)) as IAccount[];
      const mergedBackupData = this.cryptoService.encrypt(
        JSON.stringify(uniqBy([...accounts, ...newAccounts], "privateKey")),
      );

      await this.accountStorage.set(mergedBackupData);
    }
  };
}
