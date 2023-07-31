import browser from "webextension-polyfill";

import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import { OperationType, VerifiableCredential } from "@src/types";

import type { IBackupable } from "@src/background/services/backup";

import { parseSerializedVerifiableCredential } from "./utils";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";

export default class VerifiableCredentialsService implements IBackupable {
  private static INSTANCE: VerifiableCredentialsService;

  private verifiableCredentialsStore: SimpleStorage;

  private cryptoService: CryptoService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private constructor() {
    this.verifiableCredentialsStore = new SimpleStorage(VERIFIABLE_CREDENTIALS_KEY);
    this.cryptoService = CryptoService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): VerifiableCredentialsService {
    if (!VerifiableCredentialsService.INSTANCE) {
      VerifiableCredentialsService.INSTANCE = new VerifiableCredentialsService();
    }

    return VerifiableCredentialsService.INSTANCE;
  }

  addVerifiableCredential = async (serializedVerifiableCredential: string): Promise<boolean> => {
    if (!serializedVerifiableCredential) {
      return false;
    }

    try {
      const verifiableCredential = await parseSerializedVerifiableCredential(serializedVerifiableCredential);
      return this.insertVerifiableCredentialIntoStore(verifiableCredential);
    } catch (error) {
      return false;
    }
  };

  getAllVerifiableCredentials = async (): Promise<VerifiableCredential[]> => {
    const verifiableCredentials = await this.getVerifiableCredentialsFromStore();
    const verifiableCredentialsArray = Array.from(verifiableCredentials.values());

    return Promise.all(
      verifiableCredentialsArray.map(async (verifiableCredential) =>
        parseSerializedVerifiableCredential(verifiableCredential),
      ),
    );
  };

  deleteVerifiableCredential = async (verifiableCredentialId: string): Promise<boolean> => {
    if (!verifiableCredentialId) {
      return false;
    }

    const verifiableCredentials = await this.getVerifiableCredentialsFromStore();

    if (!verifiableCredentials.has(verifiableCredentialId)) {
      return false;
    }

    verifiableCredentials.delete(verifiableCredentialId);
    await this.writeVerifiableCredentials(verifiableCredentials);
    await this.historyService.trackOperation(OperationType.DELETE_VERIFIABLE_CREDENTIAL, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Credential deleted.",
        message: `Deleted 1 Verifiable Credential.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  deleteAllVerifiableCredentials = async (): Promise<boolean> => {
    const verifiableCredentials = await this.getVerifiableCredentialsFromStore();

    if (verifiableCredentials.size === 0) {
      return false;
    }

    await this.verifiableCredentialsStore.clear();
    await this.historyService.trackOperation(OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS, {});
    await this.notificationService.create({
      options: {
        title: "All Verifiable Credentials deleted.",
        message: `Deleted ${verifiableCredentials.size} Verifiable Credential(s).`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  private insertVerifiableCredentialIntoStore = async (
    verifiableCredential: VerifiableCredential,
  ): Promise<boolean> => {
    /**
     * We do not accept Verifiable Credentials that do not have a non-empty id.
     */
    if (!verifiableCredential.id) {
      return false;
    }

    const verifiableCredentialId = verifiableCredential.id.toString();

    const verifiableCredentials = await this.getVerifiableCredentialsFromStore();

    if (verifiableCredentials.has(verifiableCredentialId)) {
      return false;
    }

    verifiableCredentials.set(verifiableCredentialId, JSON.stringify(verifiableCredential));
    await this.writeVerifiableCredentials(verifiableCredentials);

    await this.historyService.trackOperation(OperationType.ADD_VERIFIABLE_CREDENTIAL, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Credential added.",
        message: `Added 1 Verifiable Credential.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  private getVerifiableCredentialsFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.verifiableCredentialsStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const decryptedCredentials = this.cryptoService.decrypt(ciphertext, { mode: ECryptMode.MNEMONIC });
    const allCredentials = new Map(JSON.parse(decryptedCredentials) as [string, string][]);

    return allCredentials;
  };

  private writeVerifiableCredentials = async (verifiableCredentials: Map<string, string>): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(verifiableCredentials));
    const ciphertext = this.cryptoService.encrypt(serializedCredentials, { mode: ECryptMode.MNEMONIC });

    await this.verifiableCredentialsStore.set(ciphertext);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.verifiableCredentialsStore.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    const backup = this.cryptoService.decrypt(backupEncryptedData, { mode: ECryptMode.MNEMONIC });
    const encryptedBackup = this.cryptoService.encrypt(backup, { secret: backupPassword });

    return this.cryptoService.generateEncryptedHmac(encryptedBackup, backupPassword);
  };

  uploadEncryptedStorage = async (
    backupEncryptedData: string | Record<string, string>,
    backupPassword: string,
  ): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    const encryptedBackup = this.cryptoService.getAuthenticCiphertext(backupEncryptedData, backupPassword);

    if (typeof encryptedBackup !== "string") {
      throw new Error("Incorrect backup format for verifiable credentials");
    }

    const backup = this.cryptoService.decrypt(encryptedBackup, { secret: backupPassword });

    const backupCredentials = new Map(JSON.parse(backup) as [string, string][]);
    const verifiableCredentials = await this.getVerifiableCredentialsFromStore();
    const mergedCredentials = new Map([...verifiableCredentials, ...backupCredentials]);

    await this.writeVerifiableCredentials(mergedCredentials);
  };
}
