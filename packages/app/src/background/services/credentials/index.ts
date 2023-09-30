import { EventName } from "@cryptkeeperzk/providers/src/event";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService, { ICreateNotificationOptions } from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import WalletService from "@src/background/services/wallet";
import { Paths } from "@src/constants";
import { OperationType, IRenameVCArgs, ICryptkeeperVerifiableCredential } from "@src/types";

import type { IVerifiablePresentation, IVerifiablePresentationRequest } from "@cryptkeeperzk/types";
import type { BackupData, IBackupable } from "@src/background/services/backup";
import type { IAddVCArgs, ISignVPArgs } from "@src/types/verifiableCredentials";

import {
  generateInitialMetadataForVC,
  serializeCryptkeeperVC,
  deserializeVC,
  deserializeCryptkeeperVC,
  validateSerializedVC,
  serializeVP,
} from "./utils";

const VERIFIABLE_CREDENTIALS_KEY = "@@VERIFIABLE-CREDENTIALS@@";
const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

interface IAnnounceVCArgs {
  notificationTitle: ICreateNotificationOptions["title"];
  notificationMessage: ICreateNotificationOptions["message"];
  notificationType: ICreateNotificationOptions["type"];
  historyOperationType?: OperationType;
  responseType?: EventName;
  responsePayload?: unknown;
}

export default class VerifiableCredentialsService implements IBackupable {
  private static INSTANCE?: VerifiableCredentialsService;

  private verifiableCredentialsStore: SimpleStorage;

  private cryptoService: CryptoService;

  private walletService: WalletService;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private browserController: BrowserUtils;

  private constructor() {
    this.verifiableCredentialsStore = new SimpleStorage(VERIFIABLE_CREDENTIALS_KEY);
    this.cryptoService = CryptoService.getInstance();
    this.walletService = WalletService.getInstance();
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

  /**
   * Handle a request to add a Verifiable Credential. Opens a popup to confirm the request.
   * @param serialized - The serialized Verifiable Credential to add.
   * @returns A promise that resolves when the popup is opened.
   */
  handleAddVCRequest = async (serialized: string): Promise<void> => {
    await validateSerializedVC(serialized);
    await this.browserController.openPopup({
      params: { redirect: Paths.ADD_VERIFIABLE_CREDENTIAL, serializedVerifiableCredential: serialized },
    });
  };

  /**
   * Announces rejection of a request to add a Verifiable Credential.
   * @returns A promise that resolves when the rejection is announced.
   */
  rejectVCRequest = async (): Promise<void> => {
    await this.announce({
      notificationTitle: "Request rejected",
      notificationMessage: `Rejected a request to add Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
      responseType: EventName.USER_REJECT,
      responsePayload: { type: EventName.VERIFIABLE_CREDENTIAL_REQUEST },
    });
  };

  /**
   * Adds a Verifiable Credential to the store.
   * @param serialized - The serialized Verifiable Credential to add.
   * @param name - User defined name for the Verifiable Credential.
   * @returns A promise that resolves when the Verifiable Credential is added.
   * @throws An error if the Verifiable Credential is invalid or already exists.
   */
  addVC = async ({ serialized, name }: IAddVCArgs): Promise<void> => {
    if (!serialized) {
      throw new Error("Serialized Verifiable Credential is required.");
    }

    try {
      const vc = await deserializeVC(serialized);
      const metadata = generateInitialMetadataForVC(vc, name);
      const cryptkeeperVC: ICryptkeeperVerifiableCredential = {
        vc,
        metadata,
      };

      await this.insertCryptkeeperVCIntoStore(cryptkeeperVC);
    } catch (error) {
      await this.announce({
        notificationTitle: "Failed to add Verifiable Credential.",
        notificationMessage: `The Verifiable Credential you are trying to add is invalid.`,
        notificationType: "basic",
      });
      throw error;
    }
  };

  /**
   * Renames a Verifiable Credential.
   * @param hash - The hash of the Verifiable Credential to rename.
   * @param newName - The new name for the Verifiable Credential.
   * @returns A promise that resolves when the Verifiable Credential is renamed.
   * @throws An error if the Verifiable Credential does not exist.
   * @throws An error if the Verifiable Credential hash or name is missing.
   */
  renameVC = async ({ hash, newName }: IRenameVCArgs): Promise<void> => {
    if (!hash || !newName) {
      throw new Error("Verifiable Credential hash and name are required.");
    }

    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();

    if (!cryptkeeperVCs.has(hash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    const serializedCryptkeeperVC = cryptkeeperVCs.get(hash)!;
    const cryptkeeperVC = await deserializeCryptkeeperVC(serializedCryptkeeperVC);

    cryptkeeperVC.metadata.name = newName;
    cryptkeeperVCs.set(hash, serializeCryptkeeperVC(cryptkeeperVC));
    await this.writeCryptkeeperVCs(cryptkeeperVCs);
    await this.announce({
      notificationTitle: "Verifiable Credential renamed.",
      notificationMessage: `Renamed 1 Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.RENAME_VERIFIABLE_CREDENTIAL,
    });
  };

  /**
   * Gets all Verifiable Credentials from the store.
   * @returns A promise that resolves with the list of Verifiable Credentials.
   */
  getAllVCs = async (): Promise<ICryptkeeperVerifiableCredential[]> => {
    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();
    const cryptkeeperVCList = Array.from(cryptkeeperVCs.values());

    return Promise.all(cryptkeeperVCList.map(async (cryptkeeperVC) => deserializeCryptkeeperVC(cryptkeeperVC)));
  };

  /**
   * Deletes a Verifiable Credential from the store.
   * @param hash - The hash of the Verifiable Credential to delete.
   * @returns A promise that resolves when the Verifiable Credential is deleted.
   * @throws An error if the Verifiable Credential does not exist.
   * @throws An error if the Verifiable Credential hash is missing.
   */
  deleteVC = async (hash: string): Promise<void> => {
    if (!hash) {
      throw new Error("Verifiable Credential hash is required.");
    }

    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();

    if (!cryptkeeperVCs.has(hash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    cryptkeeperVCs.delete(hash);
    await this.writeCryptkeeperVCs(cryptkeeperVCs);

    await this.announce({
      notificationTitle: "Verifiable Credential deleted.",
      notificationMessage: `Deleted 1 Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.DELETE_VERIFIABLE_CREDENTIAL,
    });
  };

  /**
   * Deletes all Verifiable Credentials from the store.
   * @returns A promise that resolves when all Verifiable Credentials are deleted.
   * @throws An error if there are no Verifiable Credentials to delete.
   */
  deleteAllVCs = async (): Promise<void> => {
    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();

    if (cryptkeeperVCs.size === 0) {
      throw new Error("No Verifiable Credentials to delete.");
    }

    await this.verifiableCredentialsStore.clear();
    await this.announce({
      notificationTitle: "All Verifiable Credentials deleted.",
      notificationMessage: `Deleted ${cryptkeeperVCs.size} Verifiable Credential(s).`,
      notificationType: "basic",
      historyOperationType: OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS,
    });
  };

  /**
   * Handles a request for a Verifiable Presentation. Opens a popup to confirm the request.
   * @param request - The string representing a request for a Verifiable Presentation.
   * @returns A promise that resolves when the popup is opened.
   */
  handleVPRequest = async ({ request }: IVerifiablePresentationRequest): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.GENERATE_VERIFIABLE_PRESENTATION,
        request,
      },
    });
  };

  /**
   * Announces rejection of a request for a Verifiable Presentation.
   * @returns A promise that resolves when the rejection is announced.
   */
  rejectVPRequest = async (): Promise<void> => {
    await this.announce({
      notificationTitle: "Request to generate Verifiable Presentation rejected",
      notificationMessage: `Rejected a request to generate Verifiable Presentation.`,
      notificationType: "basic",
      historyOperationType: OperationType.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
      responseType: EventName.USER_REJECT,
      responsePayload: { type: EventName.VERIFIABLE_PRESENTATION_REQUEST },
    });
  };

  /**
   * Announces a generated Verifiable Presentation.
   * @param vp - The generated Verifiable Presentation.
   * @returns A promise that resolves when the Verifiable Presentation is announced.
   */
  announceVP = async (vp: IVerifiablePresentation): Promise<void> => {
    await this.announce({
      notificationTitle: "Verifiable Presentation generated.",
      notificationMessage: `Generated 1 Verifiable Presentation.`,
      notificationType: "basic",
      historyOperationType: OperationType.NEW_VERIFIABLE_PRESENTATION,
      responseType: EventName.NEW_VERIFIABLE_PRESENTATION,
      responsePayload: { vp },
    });
  };

  /**
   * Signs and announces a generated Verifiable Presentation.
   * @param vp - The generated Verifiable Presentation.
   * @param address - The address of the signer.
   * @returns A promise that resolves when the Verifiable Presentation is signed and announced.
   */
  signAndAnnounceVP = async ({ vp, address }: ISignVPArgs): Promise<void> => {
    const serializedVP = serializeVP(vp);
    const signature = await this.walletService.signMessage({
      message: serializedVP,
      address,
    });
    const signedVP = {
      ...vp,
      proof: [
        {
          type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
          proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
          verificationMethod: address,
          created: new Date(),
          proofValue: signature,
        },
      ],
    };

    await this.announce({
      notificationTitle: "Verifiable Presentation generated.",
      notificationMessage: `Generated 1 Verifiable Presentation.`,
      notificationType: "basic",
      historyOperationType: OperationType.NEW_VERIFIABLE_PRESENTATION,
      responseType: EventName.NEW_VERIFIABLE_PRESENTATION,
      responsePayload: { vp: signedVP },
    });
  };

  /**
   * Adds a Verifiable Credential to the store.
   * @param cryptkeeperVC - The Verifiable Credential to add.
   * @returns A promise that resolves when the Verifiable Credential is added.
   * @throws An error if the Verifiable Credential already exists.
   */
  private insertCryptkeeperVCIntoStore = async (cryptkeeperVC: ICryptkeeperVerifiableCredential): Promise<void> => {
    const { hash } = cryptkeeperVC.metadata;

    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();

    if (cryptkeeperVCs.has(hash)) {
      await this.announce({
        notificationTitle: "Failed to add Verifiable Credential.",
        notificationMessage: `The Verifiable Credential you are trying to add already exists in your wallet.`,
        notificationType: "basic",
      });

      throw new Error("Verifiable Credential already exists.");
    }

    cryptkeeperVCs.set(hash, serializeCryptkeeperVC(cryptkeeperVC));
    await this.writeCryptkeeperVCs(cryptkeeperVCs);

    await this.announce({
      notificationTitle: "Verifiable Credential added.",
      notificationMessage: `Added 1 Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.NEW_VERIFIABLE_CREDENTIAL,
      responseType: EventName.NEW_VERIFIABLE_CREDENTIAL,
      responsePayload: { hash },
    });
  };

  /**
   * Gets all Verifiable Credentials from the store.
   * @returns A promise that resolves with a map from Verifiable Credential hash to serialized Verifiable Credential.
   */
  private getCryptkeeperVCsFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.verifiableCredentialsStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const decryptedCredentials = this.cryptoService.decrypt(ciphertext, { mode: ECryptMode.MNEMONIC });
    const allCredentials = new Map(JSON.parse(decryptedCredentials) as [string, string][]);

    return allCredentials;
  };

  /**
   * Writes all Verifiable Credentials to the store.
   * @param cryptkeeperVCs - The map from Verifiable Credential hash to serialized Verifiable Credential.
   * @returns A promise that resolves when the Verifiable Credentials are written.
   */
  private writeCryptkeeperVCs = async (cryptkeeperVCs: Map<string, string>): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(cryptkeeperVCs));
    const ciphertext = this.cryptoService.encrypt(serializedCredentials, { mode: ECryptMode.MNEMONIC });

    await this.verifiableCredentialsStore.set(ciphertext);
  };

  /**
   * Announces an event. This includes creating a notification, updating history, and possibly sending a browser message to certain tabs.
   * @param notificationTitle - The title of the notification.
   * @param notificationMessage - The message of the notification.
   * @param notificationType - The type of the notification.
   * @param historyOperationType - The type of the history operation.
   * @param responseType - The type of the response.
   * @param responsePayload - The payload of the response.
   */
  private announce = async ({
    notificationTitle,
    notificationMessage,
    notificationType,
    historyOperationType,
    responseType,
    responsePayload,
  }: IAnnounceVCArgs) => {
    if (historyOperationType) {
      await this.historyService.trackOperation(historyOperationType, {});
    }

    await this.notificationService.create({
      options: {
        title: notificationTitle,
        message: notificationMessage,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: notificationType,
      },
    });

    if (responseType) {
      const tabs = await browser.tabs.query({});
      await Promise.all(
        tabs.map((tab) =>
          browser.tabs
            .sendMessage(tab.id!, {
              type: responseType,
              payload: responsePayload,
            })
            .catch(() => undefined),
        ),
      );
    }
  };

  /**
   * Downloads the current Verifiable Credentials store.
   * @returns A promise that resolves with the serialized Verifiable Credentials store.
   */
  downloadStorage = (): Promise<string | null> => this.verifiableCredentialsStore.get<string>();

  /**
   * Uploads a serialized Verifiable Credentials store.
   * @param data - The backup data representing the serialized Verifiable Credentials store.
   * @returns A promise that resolves when the Verifiable Credentials store is uploaded.
   * @throws An error if the backup is invalid.
   */
  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (data && typeof data !== "string") {
      throw new Error("Incorrect restore format for credentials");
    }

    await this.verifiableCredentialsStore.set(data);
  };

  /**
   * Downloads the current Verifiable Credentials store encrypted with a password.
   * @param backupPassword - The password to encrypt the Verifiable Credentials store with.
   * @returns A promise that resolves with the encrypted Verifiable Credentials store.
   */
  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.verifiableCredentialsStore.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    const backup = this.cryptoService.decrypt(backupEncryptedData, { mode: ECryptMode.MNEMONIC });
    const encryptedBackup = this.cryptoService.encrypt(backup, { secret: backupPassword });

    return this.cryptoService.generateEncryptedHmac(encryptedBackup, backupPassword);
  };

  /**
   * Uploads a Verifiable Credentials store.
   * @param backupEncryptedData - The encrypted Verifiable Credentials store.
   * @param backupPassword - The password to decrypt the Verifiable Credentials store with.
   * @returns A promise that resolves when the Verifiable Credentials store is uploaded.
   * @throws An error if the backup is invalid.
   */
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
    const cryptkeeperVCs = await this.getCryptkeeperVCsFromStore();
    const mergedCredentials = new Map([...cryptkeeperVCs, ...backupCredentials]);

    await this.writeCryptkeeperVCs(mergedCredentials);
  };
}
