import { Wallet } from "ethers";
import uniqBy from "lodash/uniqBy";

import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import MiscStorageService from "@src/background/services/misc";
import { generateMnemonic, validateMnemonic } from "@src/background/services/mnemonic";
import SimpleStorage from "@src/background/services/storage";
import { ICheckMnemonicArgs, ISecretArgs, ISignMessageArgs, InitializationStep } from "@src/types";
import { setSelectedAccount } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { IAccount } from "./types";
import type { BackupData, IBackupable } from "../backup";

const ACCOUNT_STORAGE_DB_KEY = "@ACCOUNT-STORAGE@";
const MNEMONIC_STORAGE_DB_KEY = "@MNEMONIC-STORAGE@";
const SELECTED_ACCOUNT_STORAGE_DB_KEY = "@SELECTED-ACCOUNT-STORAGE@";

export default class WalletService implements IBackupable {
  private static INSTANCE?: WalletService;

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

  generateMnemonic = async (userMnemonic?: string): Promise<string> => {
    const accounts = await this.accountStorage.get<string>();

    if (accounts) {
      throw new Error("Key pair is already generated");
    }

    const encryptedMnemonic = await this.mnemonicStorage.get<string>();

    if (encryptedMnemonic && !userMnemonic) {
      return this.cryptoService.decrypt(encryptedMnemonic, { mode: ECryptMode.PASSWORD });
    }

    const mnemonic = userMnemonic ?? generateMnemonic();
    this.cryptoService.setMnemonic(mnemonic);
    const encrypted = this.cryptoService.encrypt(mnemonic, { mode: ECryptMode.PASSWORD });
    await this.mnemonicStorage.set(encrypted);

    return mnemonic;
  };

  generateKeyPair = async (): Promise<void> => {
    const encryptedMnemonic = await this.mnemonicStorage.get<string>();

    if (!encryptedMnemonic) {
      throw new Error("Generate mnemonic first");
    }

    const mnemonic = this.cryptoService.decrypt(encryptedMnemonic, { mode: ECryptMode.PASSWORD });
    const wallet = Wallet.fromPhrase(mnemonic);
    const rawData = await this.accountStorage.get<string>();
    this.cryptoService.setMnemonic(mnemonic);

    const accounts: IAccount[] = rawData ? (JSON.parse(rawData) as IAccount[]) : [];
    accounts.push({ publicKey: wallet.publicKey, privateKey: wallet.privateKey, address: wallet.address });

    const encrypted = this.cryptoService.encrypt(JSON.stringify(accounts), { mode: ECryptMode.MNEMONIC });
    await this.accountStorage.set(encrypted);
    await this.selectAccount(wallet.address);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.MNEMONIC });
  };

  getMnemonic = async (): Promise<string> =>
    this.mnemonicStorage
      .get<string>()
      .then((mnemonic) => (mnemonic ? this.cryptoService.decrypt(mnemonic, { mode: ECryptMode.PASSWORD }) : ""));

  selectAccount = async (address: string): Promise<string> => {
    if (!address) {
      throw new Error("No address provided");
    }

    const encryptedAccounts = await this.accountStorage.get<string>();
    const accounts = encryptedAccounts
      ? (JSON.parse(this.cryptoService.decrypt(encryptedAccounts, { mode: ECryptMode.MNEMONIC })) as IAccount[])
      : [];
    const isFound = accounts.some((account) => account.address.toLowerCase() === address.toLowerCase());

    if (!isFound) {
      throw new Error(`Account ${address} not found`);
    }

    const encrypted = this.cryptoService.encrypt(address.toLowerCase(), { mode: ECryptMode.MNEMONIC });
    await this.selectedAccountStorage.set(encrypted);
    await pushMessage(setSelectedAccount(address.toLowerCase()));

    return address.toLowerCase();
  };

  getSelectedAccount = async (): Promise<string | null> => {
    const encrypted = await this.selectedAccountStorage.get<string>();
    return encrypted && this.cryptoService.decrypt(encrypted, { mode: ECryptMode.MNEMONIC });
  };

  accounts = async (): Promise<string[]> => {
    const encryptedAccounts = await this.accountStorage.get<string>();
    const accounts = encryptedAccounts
      ? (JSON.parse(this.cryptoService.decrypt(encryptedAccounts, { mode: ECryptMode.MNEMONIC })) as IAccount[])
      : [];
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

    const accounts = JSON.parse(this.cryptoService.decrypt(encrypted, { mode: ECryptMode.MNEMONIC })) as IAccount[];
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
    const accounts = encrypted
      ? (JSON.parse(this.cryptoService.decrypt(encrypted, { secret: mnemonic })) as IAccount[])
      : [];

    const hasDerivedAccounts = accounts.some(
      (account) => account.privateKey.toLowerCase() === wallet.privateKey.toLowerCase(),
    );

    if (!hasDerivedAccounts && strict) {
      throw new Error("Unknown mnemonic");
    }

    return hasDerivedAccounts;
  };

  changeMnemonicPassword = async ({ mnemonic, password }: ISecretArgs): Promise<void> => {
    await this.checkMnemonic({ mnemonic, strict: true });
    const encryptedMnemonic = this.cryptoService.encrypt(mnemonic, { secret: password, mode: ECryptMode.PASSWORD });
    await this.mnemonicStorage.set(encryptedMnemonic);
  };

  clear = async (): Promise<void> => {
    await this.accountStorage.clear();
  };

  downloadStorage = async (): Promise<BackupData | null> => {
    const accounts = await this.accountStorage.get<string>();
    const mnemonic = await this.mnemonicStorage.get<string>();

    if (!accounts || !mnemonic) {
      return null;
    }

    return { accounts, mnemonic };
  };

  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (typeof data !== "object") {
      throw new Error("Incorrect restore format for wallet");
    }

    // Note: undefined won't rewrite values and keeps the same data
    await this.mnemonicStorage.set(data?.mnemonic ?? null);
    await this.accountStorage.set(data?.accounts ?? null);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<Record<string, string> | null> => {
    const accountsEncryptedData = await this.accountStorage.get<string>();
    const mnemonicEncryptedData = await this.mnemonicStorage.get<string>();

    if (!accountsEncryptedData || !mnemonicEncryptedData) {
      return null;
    }

    const backupAccounts = this.cryptoService.decrypt(accountsEncryptedData, { mode: ECryptMode.MNEMONIC });
    const backupMnemonic = this.cryptoService.decrypt(mnemonicEncryptedData, { mode: ECryptMode.PASSWORD });
    const encryptedBackupAccounts = this.cryptoService.encrypt(backupAccounts, { secret: backupPassword });
    const encryptedBackupMnemonic = this.cryptoService.encrypt(backupMnemonic, { secret: backupPassword });

    const accounts = this.cryptoService.generateEncryptedHmac(encryptedBackupAccounts, backupPassword);
    const mnemonic = this.cryptoService.generateEncryptedHmac(encryptedBackupMnemonic, backupPassword);

    return { accounts, mnemonic };
  };

  uploadEncryptedStorage = async (backupEncryptedData: BackupData, backupPassword: string): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    const backup = this.cryptoService.getAuthenticBackup(backupEncryptedData, backupPassword) as {
      accounts: string;
      mnemonic: string;
    };

    if (typeof backup !== "object") {
      throw new Error("Incorrect backup format for wallet");
    }

    const newAccounts = JSON.parse(
      this.cryptoService.decrypt(backup.accounts, { secret: backupPassword }),
    ) as IAccount[];
    const newMnemonic = this.cryptoService.decrypt(backup.mnemonic, { secret: backupPassword });

    const mnemonic = await this.getMnemonic();
    const encryptedAccounts = await this.accountStorage.get<string>();
    const accounts = encryptedAccounts
      ? (JSON.parse(this.cryptoService.decrypt(encryptedAccounts, { mode: ECryptMode.MNEMONIC })) as IAccount[])
      : [];

    const mergedBackupData = this.cryptoService.encrypt(
      JSON.stringify(uniqBy([...accounts, ...newAccounts], "privateKey")),
      { mode: ECryptMode.MNEMONIC, secret: mnemonic || newMnemonic },
    );
    await this.accountStorage.set(mergedBackupData);

    if (!mnemonic) {
      await this.changeMnemonicPassword({ mnemonic: newMnemonic, password: backupPassword });
      this.cryptoService.setMnemonic(newMnemonic);
      await this.miscStorage.setInitialization({ initializationStep: InitializationStep.MNEMONIC });
    }
  };
}
