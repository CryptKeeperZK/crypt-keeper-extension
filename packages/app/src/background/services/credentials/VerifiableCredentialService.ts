import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import { Paths } from "@src/constants";
import { OperationType, IRenameVerifiableCredentialArgs, ICryptkeeperVerifiableCredential } from "@src/types";
import {
  generateInitialMetadataForVC,
  serializeCryptkeeperVC,
  deserializeVC,
  deserializeCryptkeeperVC,
  validateSerializedVC,
} from "@src/util/credentials";

import type { IZkMetadata } from "@cryptkeeperzk/types";
import type { BackupData, IBackupable } from "@src/background/services/backup";
import type { IAddVerifiableCredentialArgs } from "@src/types/verifiableCredentials";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";

export default class VerifiableCredentialService implements IBackupable {
  private static INSTANCE?: VerifiableCredentialService;

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

  static getInstance(): VerifiableCredentialService {
    if (!VerifiableCredentialService.INSTANCE) {
      VerifiableCredentialService.INSTANCE = new VerifiableCredentialService();
    }

    return VerifiableCredentialService.INSTANCE;
  }

  addRequest = async (serializedVerifiableCredential: string, { urlOrigin }: IZkMetadata): Promise<void> => {
    await validateSerializedVC(serializedVerifiableCredential);
    await this.browserController.openPopup({
      params: {
        redirect: Paths.ADD_VERIFIABLE_CREDENTIAL,
        serializedVerifiableCredential,
        urlOrigin,
      },
    });
  };

  add = async ({ serialized, name }: IAddVerifiableCredentialArgs, { urlOrigin }: IZkMetadata): Promise<void> => {
    if (!serialized) {
      throw new Error("Serialized Verifiable Credential is required.");
    }

    try {
      const verifiableCredential = await deserializeVC(serialized);
      const metadata = generateInitialMetadataForVC(verifiableCredential, name);

      await this.insert({ verifiableCredential, metadata }, { urlOrigin });
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

  rename = async ({ hash, name }: IRenameVerifiableCredentialArgs): Promise<void> => {
    if (!hash || !name) {
      throw new Error("Verifiable Credential hash and name are required.");
    }

    const vcs = await this.getCryptkeeperVCsFromStore();

    if (!vcs.has(hash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    const serializedCryptkeeperVerifiableCredential = vcs.get(hash)!;
    const cryptkeeperVerifiableCredential = await deserializeCryptkeeperVC(serializedCryptkeeperVerifiableCredential);

    cryptkeeperVerifiableCredential.metadata.name = name;
    vcs.set(hash, serializeCryptkeeperVC(cryptkeeperVerifiableCredential));
    await this.writeCryptkeeperVCs(vcs);

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

  getAll = async (): Promise<ICryptkeeperVerifiableCredential[]> => {
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCsFromStore();
    const cryptkeeperVerifiableCredentialsArray = Array.from(cryptkeeperVerifiableCredentials.values());

    return Promise.all(
      cryptkeeperVerifiableCredentialsArray.map(async (cryptkeeperVerifiableCredential) =>
        deserializeCryptkeeperVC(cryptkeeperVerifiableCredential),
      ),
    );
  };

  delete = async (verifiableCredentialHash: string): Promise<void> => {
    if (!verifiableCredentialHash) {
      throw new Error("Verifiable Credential hash is required.");
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCsFromStore();

    if (!cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    cryptkeeperVerifiableCredentials.delete(verifiableCredentialHash);
    await this.writeCryptkeeperVCs(cryptkeeperVerifiableCredentials);

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

  deleteAll = async (): Promise<void> => {
    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();

    if (cryptkeeperVCs.size === 0) {
      throw new Error("No Verifiable Credentials to delete.");
    }

    await this.verifiableCredentialsStore.clear();
    await this.historyService.trackOperation(OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS, {});
    await this.notificationService.create({
      options: {
        title: "All Verifiable Credentials deleted.",
        message: `Deleted ${cryptkeeperVCs.size} Verifiable Credential(s).`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });
  };

  private insert = async (
    cryptkeeperVC: ICryptkeeperVerifiableCredential,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    const { hash } = cryptkeeperVC.metadata;

    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();

    if (cryptkeeperVCs.has(hash)) {
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

    cryptkeeperVCs.set(hash, serializeCryptkeeperVC(cryptkeeperVC));
    await this.writeCryptkeeperVCs(cryptkeeperVCs);

    await this.historyService.trackOperation(OperationType.ADD_VERIFIABLE_CREDENTIAL, {});
    await this.notificationService.create({
      options: {
        title: "Verifiable Credential added.",
        message: `Added 1 Verifiable Credential.`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    await this.browserController.pushEvent(
      {
        type: EventName.ADD_VERIFIABLE_CREDENTIAL,
        payload: { verifiableCredentialHash: hash },
      },
      { urlOrigin },
    );
  };

  private getCryptkeeperVCsFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.verifiableCredentialsStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const decryptedCredentials = this.cryptoService.decrypt(ciphertext, { mode: ECryptMode.MNEMONIC });
    return new Map(JSON.parse(decryptedCredentials) as [string, string][]);
  };

  private writeCryptkeeperVCs = async (cryptkeeperVCs: Map<string, string>): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(cryptkeeperVCs));
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
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCsFromStore();
    const mergedCredentials = new Map([...cryptkeeperVerifiableCredentials, ...backupCredentials]);

    await this.writeCryptkeeperVCs(mergedCredentials);
  };
}
