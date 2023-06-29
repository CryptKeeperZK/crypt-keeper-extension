import browser from "webextension-polyfill";

import { cryptoGenerateEncryptedHmac, cryptoGetAuthenticBackupCiphertext } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import LockerService from "@src/background/services/lock";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import { OperationType, VerifiableCredential } from "@src/types";
import { parseVerifiableCredentialFromJson } from "@src/util/credential";

import type { IBackupable } from "@src/background/services/backup";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";

export default class VerifiableCredentialsService implements IBackupable {
  private static INSTANCE: VerifiableCredentialsService;

  private verifiableCredentialsStore: SimpleStorage;

  private lockService: LockerService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private constructor() {
    this.verifiableCredentialsStore = new SimpleStorage(VERIFIABLE_CREDENTIALS_KEY);
    this.lockService = LockerService.getInstance();
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
    if (!verifiableCredentialJson || typeof verifiableCredentialJson !== "string") {
      return false;
    }

    const verifiableCredential = parseVerifiableCredentialFromJson(verifiableCredentialJson);
    if (verifiableCredential === null) {
      return false;
    }
    return this.insertVerifiableCredentialIntoStore(verifiableCredential);
  };

  getAllVerifiableCredentials = async (): Promise<VerifiableCredential[]> =>
    this.getVerifiableCredentialsFromStore()
      .then((credentials) => Array.from(credentials.values()))
      .then((credentialsArray) =>
        credentialsArray.map((credential) => parseVerifiableCredentialFromJson(credential) as VerifiableCredential),
      );

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
        message: `Credential Id: ${credentialId}`,
        iconUrl: browser.runtime.getURL("/logo.png"),
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

    const decryptedCredentials = this.lockService.decrypt(ciphertext);
    const allCredentials = new Map(JSON.parse(decryptedCredentials) as Array<[string, string]>);

    return allCredentials;
  };

  private writeVerifiableCredentials = async (credentials: Map<string, string>): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(credentials));
    const ciphertext = this.lockService.encrypt(serializedCredentials);

    await this.verifiableCredentialsStore.set(ciphertext);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.verifiableCredentialsStore.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return cryptoGenerateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    await this.verifiableCredentialsStore.set(cryptoGetAuthenticBackupCiphertext(backupEncryptedData, backupPassword));
  };
}
