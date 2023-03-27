import CryptoJS from "crypto-js";
import { browser } from "webextension-polyfill-ts";

import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import SimpleStorage from "./simpleStorage";

const PASSWORD_DB_KEY = "@password@";

interface LockStatus {
  isInitialized: boolean;
  isUnlocked: boolean;
}

export default class LockService {
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

  public static getInstance(): LockService {
    if (!LockService.INSTANCE) {
      LockService.INSTANCE = new LockService();
    }

    return LockService.INSTANCE;
  }

  /**
   *  This method is called when install event occurs
   */
  public setupPassword = async (password: string): Promise<void> => {
    const cipherText = CryptoJS.AES.encrypt(this.passwordChecker, password).toString();
    await this.passwordStorage.set(cipherText);
    await this.unlock(password);
  };

  public getStatus = async (): Promise<LockStatus> => {
    const cipherText = await this.passwordStorage.get();

    return {
      isInitialized: !!cipherText,
      isUnlocked: this.isUnlocked,
    };
  };

  public awaitUnlock = async (): Promise<unknown | undefined> => {
    if (this.isUnlocked) {
      return undefined;
    }

    return new Promise((resolve) => {
      this.unlockCB = () => resolve(undefined);
    });
  };

  public onUnlocked = (): boolean => {
    if (this.unlockCB) {
      this.unlockCB();
      this.unlockCB = undefined;
    }

    return true;
  };

  public unlock = async (password: string): Promise<boolean> => {
    if (this.isUnlocked) {
      return true;
    }

    const ciphertext = await this.passwordStorage.get<string>();

    if (!ciphertext) {
      throw new Error("Something badly gone wrong (reinstallation probably required)");
    }

    if (!password) {
      throw new Error("Password is not provided");
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const retrievedPasswordChecker = bytes.toString(CryptoJS.enc.Utf8);

    if (retrievedPasswordChecker !== this.passwordChecker) {
      throw new Error("Incorrect password");
    }

    this.password = password;
    this.isUnlocked = true;

    await this.notifyStatusChange();
    this.onUnlocked();

    return true;
  };

  public logout = async (): Promise<boolean> => {
    await this.internalLogout();

    return true;
  };

  public ensure = (payload: unknown = null): unknown | null | false => {
    if (!this.isUnlocked || !this.password) {
      return false;
    }

    return payload;
  };

  public encrypt = (payload: string): string => {
    if (!this.password) {
      throw new Error("Password is not provided");
    }

    return CryptoJS.AES.encrypt(payload, this.password).toString();
  };

  public decrypt = (ciphertext: string): string => {
    if (!this.password) {
      throw new Error("Password is not provided");
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, this.password);
    return bytes.toString(CryptoJS.enc.Utf8);
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

    await Promise.all(tabs.map((tab) => browser.tabs.sendMessage(tab.id as number, setStatus(status))));

    return status;
  };
}
