import { browser } from "webextension-polyfill-ts";

import BackupService from "@src/background/services/backup";
import { cryptoDecrypt, cryptoEncrypt, cryptoGenerateEncryptedHmac } from "@src/background/services/crypto";
import SimpleStorage from "@src/background/services/storage";
import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { IBackupable } from "@src/background/services/backup";

import { AuthenticityCheckData } from "./types";

const PASSWORD_DB_KEY = "@password@";

interface LockStatus {
  isInitialized: boolean;
  isUnlocked: boolean;
}

export default class LockerService implements IBackupable {
  private static INSTANCE: LockerService;

  private isUnlocked: boolean;

  private passwordChecker: string;

  private passwordStorage: SimpleStorage;

  private password?: string;

  private unlockCB?: () => void;

  private backupService: BackupService;

  private constructor() {
    this.isUnlocked = false;
    this.passwordChecker = "Password is correct";
    this.passwordStorage = new SimpleStorage(PASSWORD_DB_KEY);
    this.password = undefined;
    this.unlockCB = undefined;
    this.backupService = BackupService.getInstance();
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
    const cipherText = cryptoEncrypt(this.passwordChecker, password);
    await this.passwordStorage.set(cipherText);
    await this.unlock(password);
  };

  getStatus = async (): Promise<LockStatus> => {
    const cipherText = await this.passwordStorage.get();

    return {
      isInitialized: !!cipherText,
      isUnlocked: this.isUnlocked,
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

    await this.isAuthentic(password);

    this.password = password;
    this.isUnlocked = true;

    await this.notifyStatusChange();
    this.onUnlocked();

    return true;
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.passwordStorage.get<string>();
    const { isLockerAuthentic } = await this.isAuthentic(backupPassword, backupEncryptedData);

    if (isLockerAuthentic && backupEncryptedData) {
      return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
    }
    return null;
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    const { isNewOnboarding, isBackupAvaiable } = await this.isAuthentic(backupPassword, backupEncryptedData);

    if (isNewOnboarding && isBackupAvaiable) {
      const authenticBackupCiphertext = this.backupService.getAuthenticBackupCiphertext(
        backupEncryptedData,
        backupPassword,
      );
      await this.passwordStorage.set(authenticBackupCiphertext);
    }
  };

  isAuthentic = async (password: string, backupEncryptedData?: string | null): Promise<AuthenticityCheckData> => {
    const isLockerAuthentic = await this.isLockerPasswordAuthentic(password);
    const isNewOnboarding = await this.isNewOnboarding();
    const isBackupAvaiable = this.isBackupAvaiable(backupEncryptedData);

    if (!isNewOnboarding && !isLockerAuthentic && !isBackupAvaiable) throw new Error("Incorrect password");

    return {
      isLockerAuthentic,
      isNewOnboarding,
      isBackupAvaiable,
    };
  };

  private isBackupAvaiable = (backupCiphertext?: string | null) => {
    if (!backupCiphertext) return false;
    return true;
  };

  private isNewOnboarding = async () => {
    const cipherText = await this.passwordStorage.get<string>();
    if (!cipherText) return true;
    return false;
  };

  private isLockerPasswordAuthentic = async (password: string): Promise<boolean> => {
    if (!password) throw new Error("Password is not provided");

    const cipherText = await this.passwordStorage.get<string>();
    if (cipherText) {
      const decryptedPasswordChecker = cryptoDecrypt(cipherText, password);

      return decryptedPasswordChecker === this.passwordChecker;
    }

    return false;
  };

  ensure = (payload: unknown = null): unknown | null | false => {
    if (!this.isUnlocked || !this.password) {
      return false;
    }

    return payload;
  };

  encrypt = (payload: string): string => {
    if (!this.password) throw new Error("Password is not provided");
    return cryptoEncrypt(payload, this.password);
  };

  decrypt = (ciphertext: string): string => {
    if (!this.password) throw new Error("Password is not provided");
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
