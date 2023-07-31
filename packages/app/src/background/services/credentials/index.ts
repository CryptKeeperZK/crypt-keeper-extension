import browser from "webextension-polyfill";

import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import { OperationType, VerifiableCredential } from "@src/types";
import { parseVerifiableCredentialFromJson } from "@src/util/credential";

import type { IBackupable } from "@src/background/services/backup";

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

  addVerifiableCredential = async (verifiableCredentialJson: string): Promise<boolean> => {
    if (!verifiableCredentialJson) {
      return false;
    }

    const verifiableCredential = await parseVerifiableCredentialFromJson(verifiableCredentialJson);

    if (verifiableCredential === null) {
      return false;
    }

    return this.insertVerifiableCredentialIntoStore(verifiableCredential);
  };

  getAllVerifiableCredentials = async (): Promise<VerifiableCredential[]> => {
    const credentials = await this.getVerifiableCredentialsFromStore();
    const credentialsArray = Array.from(credentials.values());

    return Promise.all(
      credentialsArray.map(async (credential) => {
        const parsedCredential = await parseVerifiableCredentialFromJson(credential);
        if (!parsedCredential) {
          throw new Error("Failed to parse verifiable credential");
        }
        return parsedCredential;
      }),
    );
  };

  deleteVerifiableCredential = async (credentialId: string): Promise<boolean> => {
    if (!credentialId) {
      return false;
    }

    const credentials = await this.getVerifiableCredentialsFromStore();

    if (!credentials.has(credentialId)) {
      return false;
    }

    credentials.delete(credentialId);
    await this.writeVerifiableCredentials(credentials);
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
    const credentials = await this.getVerifiableCredentialsFromStore();

    if (credentials.size === 0) {
      return false;
    }

    await this.verifiableCredentialsStore.clear();
    await this.historyService.trackOperation(OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS, {});
    await this.notificationService.create({
      options: {
        title: "All Verifiable Credentials deleted.",
        message: `Deleted ${credentials.size} Verifiable Credential(s).`,
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

    const credentialId = verifiableCredential.id.toString();

    const credentials = await this.getVerifiableCredentialsFromStore();

    if (credentials.has(credentialId)) {
      return false;
    }

    credentials.set(credentialId, JSON.stringify(verifiableCredential));
    await this.writeVerifiableCredentials(credentials);

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

  private writeVerifiableCredentials = async (credentials: Map<string, string>): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(credentials));
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
    const credentials = await this.getVerifiableCredentialsFromStore();
    const mergedCredentials = new Map([...credentials, ...backupCredentials]);

    await this.writeVerifiableCredentials(mergedCredentials);
  };
}
