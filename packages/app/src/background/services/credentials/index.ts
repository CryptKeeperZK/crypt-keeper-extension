import browser from "webextension-polyfill";

import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import { OperationType, CryptkeeperVerifiableCredential } from "@src/types";

import type { BackupData, IBackupable } from "@src/background/services/backup";

import {
  generateInitialMetadataForVerifiableCredential,
  serializeCryptkeeperVerifiableCredential,
  deserializeVerifiableCredential,
  deserializeCryptkeeperVerifiableCredential,
} from "./utils";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";

export default class VerifiableCredentialsService implements IBackupable {
  private static INSTANCE: VerifiableCredentialsService;

  private verifiableCredentialsStore: SimpleStorage;

  private cryptoService: CryptoService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

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
      const verifiableCredential = await deserializeVerifiableCredential(serializedVerifiableCredential);
      const metadata = generateInitialMetadataForVerifiableCredential(verifiableCredential);
      const cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential = {
        verifiableCredential,
        metadata,
      };

      return this.insertCryptkeeperVerifiableCredentialIntoStore(cryptkeeperVerifiableCredential);
    } catch (error) {
      return false;
    }
  };

  getAllVerifiableCredentials = async (): Promise<CryptkeeperVerifiableCredential[]> => {
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();
    const cryptkeeperVerifiableCredentialsArray = Array.from(cryptkeeperVerifiableCredentials.values());

    return Promise.all(
      cryptkeeperVerifiableCredentialsArray.map(async (cryptkeeperVerifiableCredential) =>
        deserializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential),
      ),
    );
  };

  deleteVerifiableCredential = async (verifiableCredentialHash: string): Promise<boolean> => {
    if (!verifiableCredentialHash) {
      return false;
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (!cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      return false;
    }

    cryptkeeperVerifiableCredentials.delete(verifiableCredentialHash);
    await this.writeCryptkeeperVerifiableCredentials(cryptkeeperVerifiableCredentials);
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
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (cryptkeeperVerifiableCredentials.size === 0) {
      return false;
    }

    await this.verifiableCredentialsStore.clear();
    await this.historyService.trackOperation(OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS, {});
    await this.notificationService.create({
      options: {
        title: "All Verifiable Credentials deleted.",
        message: `Deleted ${cryptkeeperVerifiableCredentials.size} Verifiable Credential(s).`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  private insertCryptkeeperVerifiableCredentialIntoStore = async (
    cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential,
  ): Promise<boolean> => {
    const verifiableCredentialHash = cryptkeeperVerifiableCredential.metadata.hash;

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      return false;
    }

    cryptkeeperVerifiableCredentials.set(
      verifiableCredentialHash,
      serializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential),
    );
    await this.writeCryptkeeperVerifiableCredentials(cryptkeeperVerifiableCredentials);

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

  private getCryptkeeperVerifiableCredentialsFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.verifiableCredentialsStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const decryptedCredentials = this.cryptoService.decrypt(ciphertext, { mode: ECryptMode.MNEMONIC });
    const allCredentials = new Map(JSON.parse(decryptedCredentials) as [string, string][]);

    return allCredentials;
  };

  private writeCryptkeeperVerifiableCredentials = async (
    cryptkeeperVerifiableCredentials: Map<string, string>,
  ): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(cryptkeeperVerifiableCredentials));
    const ciphertext = this.cryptoService.encrypt(serializedCredentials, { mode: ECryptMode.MNEMONIC });

    await this.verifiableCredentialsStore.set(ciphertext);
  };

  downloadStorage = (): Promise<string | null> => this.verifiableCredentialsStore.get<string>();

  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (data && typeof data !== "string") {
      throw new Error("Incorrect restore format for credentials");
    }

    await this.verifiableCredentialsStore.set(data);
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

    const encryptedBackup = this.cryptoService.getAuthenticBackup(backupEncryptedData, backupPassword);

    if (typeof encryptedBackup !== "string") {
      throw new Error("Incorrect backup format for credentials");
    }

    const backup = this.cryptoService.decrypt(encryptedBackup, { secret: backupPassword });

    const backupCredentials = new Map(JSON.parse(backup) as [string, string][]);
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();
    const mergedCredentials = new Map([...cryptkeeperVerifiableCredentials, ...backupCredentials]);

    await this.writeCryptkeeperVerifiableCredentials(mergedCredentials);
  };
}
