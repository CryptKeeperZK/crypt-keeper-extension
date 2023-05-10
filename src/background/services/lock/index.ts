import { browser } from "webextension-polyfill-ts";

import {
  cryptoDecrypt,
  cryptoEncrypt,
  cryptoGenerateEncryptedHmac,
  cryptoGetAuthenticBackupCiphertext,
} from "@src/background/services/crypto";
import MiscStorageService, { InitializationStep } from "@src/background/services/misc";
import SimpleStorage from "@src/background/services/storage";
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

  private password?: string;

  private unlockCB?: () => void;

  private constructor() {
    this.isUnlocked = false;
    this.passwordChecker = "Password is correct";
    this.passwordStorage = new SimpleStorage(PASSWORD_DB_KEY);
    this.miscStorage = MiscStorageService.getInstance();
    this.password = undefined;
    this.unlockCB = undefined;
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
    const ciphertext = cryptoEncrypt(this.passwordChecker, password);
    await this.passwordStorage.set(ciphertext);
    await this.unlock(password);
    await this.miscStorage.setInitialization({ initializationStep: InitializationStep.PASSWORD });
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

    await this.isAuthentic(password, false);

    this.password = password;
    this.isUnlocked = true;

    await this.notifyStatusChange();
    this.onUnlocked();

    return true;
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.passwordStorage.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    const { isNewOnboarding } = await this.isAuthentic(backupPassword, true);

    if (isNewOnboarding && backupEncryptedData) {
      const authenticBackupCiphertext = cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword);
      await this.passwordStorage.set(authenticBackupCiphertext);
    }
  };

  isAuthentic = async (password: string, isBackupAvaiable: boolean): Promise<AuthenticityCheckData> => {
    const isLockerAuthentic = await this.isLockerPasswordAuthentic(password);
    const isNewOnboarding = await this.isNewOnboarding();

    if (!isNewOnboarding && !isLockerAuthentic) {
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
    if (!password) {
      throw new Error("Password is not provided");
    }

    const ciphertext = await this.passwordStorage.get<string>();

    if (!ciphertext) {
      return false;
    }

    const decryptedPasswordChecker = cryptoDecrypt(ciphertext, password);
    return decryptedPasswordChecker === this.passwordChecker;
  };

  ensure = (payload: unknown = null): unknown | null | false => {
    if (!this.isUnlocked || !this.password) {
      return false;
    }

    return payload;
  };

  encrypt = (payload: string): string => {
    if (!this.password) {
      throw new Error("Password is not provided");
    }

    return cryptoEncrypt(payload, this.password);
  };

  decrypt = (ciphertext: string): string => {
    if (!this.password) {
      throw new Error("Password is not provided");
    }

    return cryptoDecrypt(ciphertext, this.password);
  };

  logout = async (): Promise<boolean> => {
    await this.internalLogout();

    return true;
  };

  private internalLogout = async (): Promise<LockStatus> => {
    this.isUnlocked = false;
    this.password = undefined;
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
