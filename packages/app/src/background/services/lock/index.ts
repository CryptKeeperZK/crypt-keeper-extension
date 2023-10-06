import browser from "webextension-polyfill";

import BaseService from "@src/background/services/base";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import MiscStorageService from "@src/background/services/misc";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import WalletService from "@src/background/services/wallet";
import { ICheckPasswordArgs, ISecretArgs, InitializationStep, OperationType } from "@src/types";
import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { AuthenticityCheckData } from "./types";
import type { BackupData, IBackupable } from "@src/background/services/backup";

const PASSWORD_DB_KEY = "@password@";

interface LockStatus {
  isInitialized: boolean;
  isUnlocked: boolean;
  isMnemonicGenerated: boolean;
}

export default class LockerService extends BaseService implements IBackupable {
  private static INSTANCE?: LockerService;

  private passwordChecker: string;

  private passwordStorage: SimpleStorage;

  private miscStorage: MiscStorageService;

  private cryptoService: CryptoService;

  private walletService: WalletService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private constructor() {
    super();
    this.passwordChecker = "Password is correct";
    this.passwordStorage = new SimpleStorage(PASSWORD_DB_KEY);
    this.miscStorage = MiscStorageService.getInstance();
    this.cryptoService = CryptoService.getInstance();
    this.walletService = WalletService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): LockerService {
    if (!LockerService.INSTANCE) {
      LockerService.INSTANCE = new LockerService();
    }

    return LockerService.INSTANCE;
  }

  /**
   *  This method is called when install event occurs
   */
  setupPassword = async (password: string, notify = true): Promise<void> => {
    const encryptedPassword = await this.passwordStorage.get();

    if (encryptedPassword) {
      throw new Error("Password is already initialized");
    }

    await this.writePassword(password);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.PASSWORD });
    await this.unlock(password, notify);
  };

  resetPassword = async ({ mnemonic, password }: ISecretArgs): Promise<void> => {
    await this.walletService.changeMnemonicPassword({ mnemonic, password });
    this.cryptoService.setPassword(password);
    this.writePassword(password);
    await this.unlock(password);

    await this.historyService.loadSettings();
    await this.historyService.trackOperation(OperationType.RESET_PASSWORD, {});
    await this.notificationService.create({
      options: {
        title: "Password reset",
        message: "Password has been successfully reset",
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });
  };

  checkPassword = ({ password }: ICheckPasswordArgs): boolean => this.cryptoService.isAuthenticPassword(password);

  private writePassword = async (password: string): Promise<void> => {
    const ciphertext = this.cryptoService.encrypt(this.passwordChecker, { secret: password });
    await this.passwordStorage.set(ciphertext);
  };

  getStatus = async (): Promise<LockStatus> => {
    const ciphertext = await this.passwordStorage.get();
    const initializationStep = await this.miscStorage.getInitialization();

    return {
      isInitialized: Boolean(ciphertext) || initializationStep >= InitializationStep.PASSWORD,
      isUnlocked: this.isUnlocked,
      isMnemonicGenerated: initializationStep >= InitializationStep.MNEMONIC,
    };
  };

  unlock = async (password: string, notify = true): Promise<boolean> => {
    const status = await this.getStatus();

    this.cryptoService.setPassword(password);
    await this.isAuthentic(password, false)
      .then(() => {
        if (status.isMnemonicGenerated) {
          this.walletService.getMnemonic().then((mnemonic: string) => this.cryptoService.setMnemonic(mnemonic));
        }

        this.isUnlocked = true;
      })
      .then(() => {
        if (notify) {
          this.notifyStatusChange();
        }
      })
      .then(this.onUnlocked)
      .catch((error) => {
        this.cryptoService.clear();

        throw error;
      });

    return true;
  };

  downloadStorage = (): Promise<string | null> => this.passwordStorage.get<string>();

  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (data && typeof data !== "string") {
      throw new Error("Incorrect restore format for password");
    }

    await this.passwordStorage.set(data);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const data = await this.passwordStorage.get<string>();

    if (!data) {
      return null;
    }

    const backup = this.cryptoService.decrypt(data, { mode: ECryptMode.PASSWORD });
    const encryptedBackup = this.cryptoService.encrypt(backup, { secret: backupPassword });

    return this.cryptoService.generateEncryptedHmac(encryptedBackup, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: BackupData, backupPassword: string): Promise<void> => {
    const isNewOnboarding = await this.isNewOnboarding();
    const canProcessBackup = isNewOnboarding && backupEncryptedData;

    if (!canProcessBackup) {
      return;
    }

    const authenticBackupCiphertext = this.cryptoService.getAuthenticBackup(backupEncryptedData, backupPassword);

    if (typeof authenticBackupCiphertext !== "string") {
      throw new Error("Incorrect backup format for password");
    }

    await this.setupPassword(backupPassword, false);
  };

  private isAuthentic = async (password: string, isBackupAvailable: boolean): Promise<AuthenticityCheckData> => {
    const isPasswordAuthentic = await this.isLockerPasswordAuthentic(password);
    const isNewOnboarding = await this.isNewOnboarding();

    if (!isNewOnboarding && !isPasswordAuthentic) {
      throw new Error("Incorrect password");
    }

    if (isNewOnboarding && !isBackupAvailable) {
      throw new Error("Something badly gone wrong (reinstallation probably required)");
    }

    return {
      isNewOnboarding,
    };
  };

  private isNewOnboarding = async () => {
    const ciphertext = await this.passwordStorage.get<string>();

    return !ciphertext;
  };

  private isLockerPasswordAuthentic = async (password: string): Promise<boolean> => {
    const ciphertext = await this.passwordStorage.get<string>();

    if (!ciphertext) {
      return false;
    }

    const decryptedPasswordChecker = this.cryptoService.decrypt(ciphertext, { secret: password });
    return decryptedPasswordChecker === this.passwordChecker;
  };

  ensure = (payload: unknown): unknown => {
    if (!this.isUnlocked) {
      return false;
    }

    return payload;
  };

  logout = async (): Promise<boolean> => {
    await this.internalLogout();

    return true;
  };

  private internalLogout = async (): Promise<LockStatus> => {
    this.isUnlocked = false;
    this.cryptoService.clear();
    this.unlockCB = undefined;

    return this.notifyStatusChange();
  };

  private notifyStatusChange = async (): Promise<LockStatus> => {
    const status = await this.getStatus();
    await pushMessage(setStatus(status));

    const tabs = await browser.tabs.query({ active: true });

    await Promise.all(tabs.map((tab) => browser.tabs.sendMessage(tab.id!, setStatus(status)).catch(() => undefined)));

    return status;
  };
}
