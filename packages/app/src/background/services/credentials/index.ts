import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import { Paths } from "@src/constants";
import { OperationType, IRenameVerifiableCredentialArgs, ICryptkeeperVerifiableCredential } from "@src/types";
import { IVerifiablePresentationRequest } from "@cryptkeeperzk/types";
import { IAddVerifiableCredentialArgs } from "@src/types/verifiableCredentials";

import type { BackupData, IBackupable } from "@src/background/services/backup";

import {
  generateInitialMetadataForVerifiableCredential,
  serializeCryptkeeperVerifiableCredential,
  deserializeVerifiableCredential,
  deserializeCryptkeeperVerifiableCredential,
  validateSerializedVerifiableCredential,
  generateVerifiablePresentationFromVerifiableCredentials,
} from "./utils";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";

export default class VerifiableCredentialsService implements IBackupable {
  private static INSTANCE?: VerifiableCredentialsService;

  private verifiableCredentialsStore: SimpleStorage;

  private cryptoService: CryptoService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private browserController: BrowserUtils;

  private constructor() {
    this.verifiableCredentialsStore = new SimpleStorage(VERIFIABLE_CREDENTIALS_KEY);
    this.cryptoService = CryptoService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.browserController = BrowserUtils.getInstance();
  }

  static getInstance(): VerifiableCredentialsService {
    if (!VerifiableCredentialsService.INSTANCE) {
      VerifiableCredentialsService.INSTANCE = new VerifiableCredentialsService();
    }

    return VerifiableCredentialsService.INSTANCE;
  }

  addVerifiableCredentialRequest = async (serializedVerifiableCredential: string): Promise<void> => {
    await validateSerializedVerifiableCredential(serializedVerifiableCredential);
    await this.browserController.openPopup({
      params: { redirect: Paths.ADD_VERIFIABLE_CREDENTIAL, serializedVerifiableCredential },
    });
  };

  rejectVerifiableCredentialRequest = async (): Promise<void> => {
    await this.historyService.trackOperation(OperationType.REJECT_VERIFIABLE_CREDENTIAL_REQUEST, {});
    await this.notificationService.create({
      options: {
        title: "Request to add Verifiable Credential rejected",
        message: `Rejected a request to add 1 Verifiable Credential.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });
    const tabs = await browser.tabs.query({ active: true });
    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(tab.id!, {
            type: EventName.REJECT_VERIFIABLE_CREDENTIAL,
          })
          .catch(() => undefined),
      ),
    );
  };

  addVerifiableCredential = async (addVerifiableCredentialArgs: IAddVerifiableCredentialArgs): Promise<void> => {
    const { serializedVerifiableCredential, verifiableCredentialName } = addVerifiableCredentialArgs;
    if (!serializedVerifiableCredential) {
      throw new Error("Serialized Verifiable Credential is required.");
    }

    try {
      const verifiableCredential = await deserializeVerifiableCredential(serializedVerifiableCredential);
      const metadata = generateInitialMetadataForVerifiableCredential(verifiableCredential, verifiableCredentialName);
      const cryptkeeperVerifiableCredential: ICryptkeeperVerifiableCredential = {
        verifiableCredential,
        metadata,
      };

      await this.insertCryptkeeperVerifiableCredentialIntoStore(cryptkeeperVerifiableCredential);
    } catch (error) {
      await this.notificationService.create({
        options: {
          title: "Failed to add Verifiable Credential.",
          message: `The Verifiable Credential you are trying to add is invalid.`,
          iconUrl: browser.runtime.getURL("/icons/logo.png"),
          type: "basic",
        },
      });

      throw error;
    }
  };

  renameVerifiableCredential = async (
    renameVerifiableCredentialArgs: IRenameVerifiableCredentialArgs,
  ): Promise<void> => {
    const { verifiableCredentialHash, newVerifiableCredentialName } = renameVerifiableCredentialArgs;
    if (!verifiableCredentialHash || !newVerifiableCredentialName) {
      throw new Error("Verifiable Credential hash and name are required.");
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (!cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    const serializedCryptkeeperVerifiableCredential = cryptkeeperVerifiableCredentials.get(verifiableCredentialHash)!;
    const cryptkeeperVerifiableCredential = await deserializeCryptkeeperVerifiableCredential(
      serializedCryptkeeperVerifiableCredential,
    );

    cryptkeeperVerifiableCredential.metadata.name = newVerifiableCredentialName;
    cryptkeeperVerifiableCredentials.set(
      verifiableCredentialHash,
      serializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential),
    );
    await this.writeCryptkeeperVerifiableCredentials(cryptkeeperVerifiableCredentials);
    await this.historyService.trackOperation(OperationType.RENAME_VERIFIABLE_CREDENTIAL, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Credential renamed.",
        message: `Renamed 1 Verifiable Credential.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });
  };

  getAllVerifiableCredentials = async (): Promise<ICryptkeeperVerifiableCredential[]> => {
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();
    const cryptkeeperVerifiableCredentialsArray = Array.from(cryptkeeperVerifiableCredentials.values());

    return Promise.all(
      cryptkeeperVerifiableCredentialsArray.map(async (cryptkeeperVerifiableCredential) =>
        deserializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential),
      ),
    );
  };

  deleteVerifiableCredential = async (verifiableCredentialHash: string): Promise<void> => {
    if (!verifiableCredentialHash) {
      throw new Error("Verifiable Credential hash is required.");
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (!cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      throw new Error("Verifiable Credential does not exist.");
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
  };

  deleteAllVerifiableCredentials = async (): Promise<void> => {
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (cryptkeeperVerifiableCredentials.size === 0) {
      throw new Error("No Verifiable Credentials to delete.");
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
  };

  generateVerifiablePresentationRequest = async (
    verifiablePresentationRequest: IVerifiablePresentationRequest,
  ): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.GENERATE_VERIFIABLE_PRESENTATION_REQUEST,
        request: verifiablePresentationRequest.request,
      },
    });
  };

  generateVerifiablePresentation = async (credentialHashes: string[]): Promise<void> => {
    if (!credentialHashes || credentialHashes.length === 0) {
      throw new Error("Verifiable Credential hashes are required.");
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();
    const verifiableCredentials = await Promise.all(
      credentialHashes.map(async (credentialHash) => {
        if (!cryptkeeperVerifiableCredentials.has(credentialHash)) {
          throw new Error("Verifiable Credential does not exist.");
        }

        const serializedCryptkeeperVerifiableCredential = cryptkeeperVerifiableCredentials.get(credentialHash)!;
        const cryptkeeperVerifiableCredential = await deserializeCryptkeeperVerifiableCredential(
          serializedCryptkeeperVerifiableCredential,
        );

        return cryptkeeperVerifiableCredential.verifiableCredential;
      }),
    );
    const verifiablePresentation = generateVerifiablePresentationFromVerifiableCredentials(verifiableCredentials);

    await this.historyService.trackOperation(OperationType.GENERATE_VERIFIABLE_PRESENTATION, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Presentation generated.",
        message: `Generated 1 Verifiable Presentation.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });
    const tabs = await browser.tabs.query({ active: true });
    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(tab.id!, {
            action: EventName.GENERATE_VERIFIABLE_PRESENTATION,
            verifiablePresentation,
          })
          .catch(() => undefined),
      ),
    );
  };

  rejectVerifiablePresentationRequest = async (): Promise<void> => {
    await this.historyService.trackOperation(OperationType.REJECT_VERIFIABLE_PRESENTATION_REQUEST, {});
    await this.notificationService.create({
      options: {
        title: "Request to generate Verifiable Presentation rejected",
        message: `Rejected a request to generate 1 Verifiable Presentation.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });
    const tabs = await browser.tabs.query({ active: true });
    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(tab.id!, {
            action: EventName.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
          })
          .catch(() => undefined),
      ),
    );
  };

  private insertCryptkeeperVerifiableCredentialIntoStore = async (
    cryptkeeperVerifiableCredential: ICryptkeeperVerifiableCredential,
  ): Promise<void> => {
    const verifiableCredentialHash = cryptkeeperVerifiableCredential.metadata.hash;

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVerifiableCredentialsFromStore();

    if (cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      await this.notificationService.create({
        options: {
          title: "Failed to add Verifiable Credential.",
          message: `The Verifiable Credential you are trying to add already exists in your wallet.`,
          iconUrl: browser.runtime.getURL("/icons/logo.png"),
          type: "basic",
        },
      });

      throw new Error("Verifiable Credential already exists.");
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
    const tabs = await browser.tabs.query({ active: true });
    await Promise.all(
      tabs.map((tab) =>
        browser.tabs
          .sendMessage(tab.id!, {
            type: EventName.ADD_VERIFIABLE_CREDENTIAL,
            payload: { verifiableCredentialHash },
          })
          .catch(() => undefined),
      ),
    );
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
