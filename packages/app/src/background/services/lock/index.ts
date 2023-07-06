import browser from "webextension-polyfill";

import CryptoService from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import MiscStorageService from "@src/background/services/misc";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import WalletService from "@src/background/services/wallet";
import { IResetPasswordArgs, InitializationStep, OperationType } from "@src/types";
import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { AuthenticityCheckData } from "./types";
import type { IBackupable } from "@src/background/services/backup";

const PASSWORD_DB_KEY = "@password@";

interface LockStatus {
  isInitialized: boolean;
  isUnlocked: boolean;
  isMnemonicGenerated: boolean;
}

export default class LockerService implements IBackupable {
  private static INSTANCE: LockerService;

  private isUnlocked: boolean;

  private passwordChecker: string;

  private passwordStorage: SimpleStorage;

  private miscStorage: MiscStorageService;

  private cryptoService: CryptoService;

  private walletService: WalletService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private unlockCB?: () => void;

  private constructor() {
    this.isUnlocked = false;
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
  setupPassword = async (password: string): Promise<void> => {
    const encryptedPassword = await this.passwordStorage.get();

    if (encryptedPassword) {
      throw new Error("Password is already initialized");
    }

    await this.writePassword(password);
    await this.unlock(password);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.PASSWORD });
  };

  resetPassword = async ({ mnemonic, password }: IResetPasswordArgs): Promise<void> => {
    await this.walletService.changeMnemonicPassword({ mnemonic, password });
    this.cryptoService.setPassword(password);
    this.writePassword(password);
    await this.unlock(password);

    await this.historyService.trackOperation(OperationType.RESET_PASSWORD, {});
    await this.notificationService.create({
      options: {
        title: "Password reset",
        message: "Password has been successfully reset",
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });
  };

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

  awaitUnlock = async (): Promise<unknown | undefined> => {
    if (this.isUnlocked) {
      return undefined;
    }

    return new Promise((resolve) => {
      this.unlockCB = () => resolve(undefined);
    });
  };

  onUnlocked = (): boolean => {
    if (this.unlockCB) {
      this.unlockCB();
      this.unlockCB = undefined;
    }

    return true;
  };

  unlock = async (password: string): Promise<boolean> => {
    if (this.isUnlocked) {
      return true;
    }

    const status = await this.getStatus();

    this.cryptoService.setPassword(password);
    await this.isAuthentic(password, false)
      .then(() => {
        if (status.isMnemonicGenerated) {
          this.walletService.getMnemonic().then((mnemonic: string) => this.cryptoService.setMnemonic(mnemonic));
        }

        this.isUnlocked = true;
      })
      .then(() => this.notifyStatusChange())
      .then(this.onUnlocked)
      .catch((error) => {
        this.cryptoService.clear();

        throw error;
      });

    return true;
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.passwordStorage.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    return this.cryptoService.generateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    const isNewOnboarding = await this.isNewOnboarding();

    if (isNewOnboarding && backupEncryptedData) {
      const authenticBackupCiphertext = this.cryptoService.getAuthenticCiphertext(backupEncryptedData, backupPassword);
      await this.passwordStorage.set(authenticBackupCiphertext);
    }
  };

  private isAuthentic = async (password: string, isBackupAvaiable: boolean): Promise<AuthenticityCheckData> => {
    const isPasswordAuthentic = await this.isLockerPasswordAuthentic(password);
    const isNewOnboarding = await this.isNewOnboarding();

    if (!isNewOnboarding && !isPasswordAuthentic) {
      throw new Error("Incorrect password");
    }

    if (isNewOnboarding && !isBackupAvaiable) {
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

  ensure = (payload: unknown = null): unknown | null | false => {
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

    await Promise.all(
      tabs.map((tab) => browser.tabs.sendMessage(tab.id as number, setStatus(status)).catch(() => undefined)),
    );

    return status;
  };
}
