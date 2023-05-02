import { browser } from "webextension-polyfill-ts";

import {
  cryptoDecrypt,
  cryptoEncrypt,
  isCryptoHmacAuthentic,
  cryptoSubHmacCiphertext,
} from "@src/background/services/crypto";
import SimpleStorage from "@src/background/services/storage";
import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import type { IBackupable } from "@src/background/services/backup";

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

  private constructor() {
    this.isUnlocked = false;
    this.passwordChecker = "Password is correct";
    this.passwordStorage = new SimpleStorage(PASSWORD_DB_KEY);
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

    await this.isAuthenticated(password);

    this.password = password;
    this.isUnlocked = true;

    await this.notifyStatusChange();
    this.onUnlocked();

    return true;
  };

  downloadEncryptedStorage = (): Promise<string | null> => this.passwordStorage.get<string>();

  uploadEncryptedStorage = async (encryptedBackup: string, password: string): Promise<void> => {
    const { isNew, authenticBackupCiphertext } = await this.isAuthenticated(password, encryptedBackup);
    if (isNew && authenticBackupCiphertext) await this.passwordStorage.set(authenticBackupCiphertext);
  };

  // TODO: Unit test needed, it is meant to replace checkPassword
  isAuthenticated = async (
    password: string,
    backupCiphertext?: string,
  ): Promise<{ isAuthentic: boolean; isBackup?: boolean; isNew?: boolean; authenticBackupCiphertext?: string }> => {
    const cipherText = await this.passwordStorage.get<string>();

    if (!password) throw new Error("Password is not provided");

    // Normal check
    if (cipherText) {
      const decryptedPasswordChecker = cryptoDecrypt(cipherText, password);

      if (decryptedPasswordChecker !== this.passwordChecker) throw new Error("Incorrect password");
      else {
        if (backupCiphertext)
          return {
            isAuthentic: true,
            isNew: false,
            authenticBackupCiphertext: this.isBackupCiphertextAutentic(backupCiphertext),
          };

        return {
          isAuthentic: true,
        };
      }
    }
    // Newly installed CK
    // We should return an object if it
    else {
      if (backupCiphertext) {
        return {
          isAuthentic: true, // Becuase a new installed wallet
          isNew: true,
          authenticBackupCiphertext: this.isBackupCiphertextAutentic(backupCiphertext),
        };
      }

      throw new Error("Something badly gone wrong (reinstallation probably required)");
    }
  };

  private isBackupCiphertextAutentic = (backupCiphertext: string): string => {
    const { isHmacAuthentic, authenticCiphertext: authenticBackupCiphertext } = this.isHmacAuthentic(backupCiphertext);
    if (!isHmacAuthentic || !authenticBackupCiphertext) throw new Error("This backup file is not authentic.");
    else {
      return authenticBackupCiphertext;
    }
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

  private isHmacAuthentic = (ciphertext: string): { isHmacAuthentic: boolean; authenticCiphertext?: string } => {
    if (!this.password) throw new Error("Password is not provided");
    const isHmacAuthentic = isCryptoHmacAuthentic(ciphertext, this.password);
    if (!isHmacAuthentic) return { isHmacAuthentic };
    else {
      const { transitCipherContent: authenticCiphertext } = cryptoSubHmacCiphertext(ciphertext);
      return {
        isHmacAuthentic,
        authenticCiphertext,
      };
    }
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
