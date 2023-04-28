import CryptoJS from "crypto-js";
import { browser } from "webextension-polyfill-ts";

import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { IBackupable } from "../backup";

import SimpleStorage from "../storage";

const PASSWORD_DB_KEY = "@password@";

interface LockStatus {
  isInitialized: boolean;
  isUnlocked: boolean;
}

export default class LockService implements IBackupable {
  private static INSTANCE: LockService;

  private isUnlocked: boolean;

  private passwordChecker: string;

  private passwordStorage: SimpleStorage;

  private password?: string;

  private unlockCB?: () => void;

  private constructor() {
    this.isUnlocked = false;
    this.passwordChecker = "Password is correct";
    this.passwordStorage = new SimpleStorage(PASSWORD_DB_KEY);
    this.password = undefined;
    this.unlockCB = undefined;
  }

  static getInstance(): LockService {
    if (!LockService.INSTANCE) {
      LockService.INSTANCE = new LockService();
    }

    return LockService.INSTANCE;
  }

  /**
   *  This method is called when install event occurs
   */
  setupPassword = async (password: string): Promise<void> => {
    const cipherText = CryptoJS.AES.encrypt(this.passwordChecker, password).toString();
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

    await this.checkPassword(password);

    this.password = password;
    this.isUnlocked = true;

    await this.notifyStatusChange();
    this.onUnlocked();

    return true;
  };

  downloadEncryptedStorage = (): Promise<string | null> => this.passwordStorage.get<string>();

  uploadEncryptedStorage = async (encryptedStorage: string, password: string): Promise<void> => {
    await this.checkPassword(password);
    await this.passwordStorage.set(encryptedStorage);
  };

  checkPassword = async (password: string): Promise<void> => {
    const cipherText = await this.passwordStorage.get<string>();

    if (!cipherText) {
      throw new Error("Something badly gone wrong (reinstallation probably required)");
    }

    if (!password) {
      throw new Error("Password is not provided");
    }

    const bytes = CryptoJS.AES.decrypt(cipherText, password);
    const retrievedPasswordChecker = bytes.toString(CryptoJS.enc.Utf8);

    if (retrievedPasswordChecker !== this.passwordChecker) {
      throw new Error("Incorrect password");
    }
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

    return CryptoJS.AES.encrypt(payload, this.password).toString();
  };

  decrypt = (ciphertext: string): string => {
    if (!this.password) {
      throw new Error("Password is not provided");
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, this.password);
    return bytes.toString(CryptoJS.enc.Utf8);
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
