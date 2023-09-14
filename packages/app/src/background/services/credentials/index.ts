import { EventName } from "@cryptkeeperzk/providers/dist/src/event";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService, { ICreateNotificationOptions } from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import WalletService from "@src/background/services/wallet";
import { Paths } from "@src/constants";
import { OperationType, IRenameVerifiableCredentialArgs, ICryptkeeperVerifiableCredential } from "@src/types";

import type { IVerifiablePresentation, IVerifiablePresentationRequest } from "@cryptkeeperzk/types";
import type { BackupData, IBackupable } from "@src/background/services/backup";
import type {
  IAddVerifiableCredentialArgs,
  IGenerateVerifiablePresentationWithCryptkeeperArgs,
} from "@src/types/verifiableCredentials";

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

  addVCRequest = async (serializedVerifiableCredential: string): Promise<void> => {
    await validateSerializedVC(serializedVerifiableCredential);
    await this.browserController.openPopup({
      params: { redirect: Paths.ADD_VERIFIABLE_CREDENTIAL, serializedVerifiableCredential },
    });
  };

  rejectVCRequest = async (): Promise<void> => {
    await this.announce({
      notificationTitle: "Request rejected",
      notificationMessage: `Rejected a request to add Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
      responseType: EventName.USER_REJECT,
      responsePayload: { type: EventName.ADD_VERIFIABLE_CREDENTIAL },
    });
  };

  addVC = async (addVCArgs: IAddVerifiableCredentialArgs): Promise<void> => {
    const { serializedVerifiableCredential, verifiableCredentialName } = addVCArgs;
    if (!serializedVerifiableCredential) {
      throw new Error("Serialized Verifiable Credential is required.");
    }

    try {
      const verifiableCredential = await deserializeVC(serializedVerifiableCredential);
      const metadata = generateInitialMetadataForVC(verifiableCredential, verifiableCredentialName);
      const cryptkeeperVerifiableCredential: ICryptkeeperVerifiableCredential = {
        verifiableCredential,
        metadata,
      };

      await this.insertCryptkeeperVCIntoStore(cryptkeeperVerifiableCredential);
    } catch (error) {
      await this.announce({
        notificationTitle: "Failed to add Verifiable Credential.",
        notificationMessage: `The Verifiable Credential you are trying to add is invalid.`,
        notificationType: "basic",
      });
      throw error;
    }
  };

  renameVC = async (renameVCArgs: IRenameVerifiableCredentialArgs): Promise<void> => {
    const { verifiableCredentialHash, newVerifiableCredentialName } = renameVCArgs;
    if (!verifiableCredentialHash || !newVerifiableCredentialName) {
      throw new Error("Verifiable Credential hash and name are required.");
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCFromStore();

    if (!cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    const serializedCryptkeeperVerifiableCredential = cryptkeeperVerifiableCredentials.get(verifiableCredentialHash)!;
    const cryptkeeperVerifiableCredential = await deserializeCryptkeeperVC(serializedCryptkeeperVerifiableCredential);

    cryptkeeperVerifiableCredential.metadata.name = newVerifiableCredentialName;
    cryptkeeperVerifiableCredentials.set(
      verifiableCredentialHash,
      serializeCryptkeeperVC(cryptkeeperVerifiableCredential),
    );
    await this.writeCryptkeeperVC(cryptkeeperVerifiableCredentials);
    await this.announce({
      notificationTitle: "Verifiable Credential renamed.",
      notificationMessage: `Renamed 1 Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.RENAME_VERIFIABLE_CREDENTIAL,
    });
  };

  getAllVC = async (): Promise<ICryptkeeperVerifiableCredential[]> => {
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCFromStore();
    const cryptkeeperVerifiableCredentialsArray = Array.from(cryptkeeperVerifiableCredentials.values());

    return Promise.all(
      cryptkeeperVerifiableCredentialsArray.map(async (cryptkeeperVerifiableCredential) =>
        deserializeCryptkeeperVC(cryptkeeperVerifiableCredential),
      ),
    );
  };

  deleteVC = async (verifiableCredentialHash: string): Promise<void> => {
    if (!verifiableCredentialHash) {
      throw new Error("Verifiable Credential hash is required.");
    }

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCFromStore();

    if (!cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      throw new Error("Verifiable Credential does not exist.");
    }

    cryptkeeperVerifiableCredentials.delete(verifiableCredentialHash);
    await this.writeCryptkeeperVC(cryptkeeperVerifiableCredentials);

    await this.announce({
      notificationTitle: "Verifiable Credential deleted.",
      notificationMessage: `Deleted 1 Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.DELETE_VERIFIABLE_CREDENTIAL,
    });
  };

  deleteAllVC = async (): Promise<void> => {
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCFromStore();

    if (cryptkeeperVerifiableCredentials.size === 0) {
      throw new Error("No Verifiable Credentials to delete.");
    }

    await this.verifiableCredentialsStore.clear();
    await this.announce({
      notificationTitle: "All Verifiable Credentials deleted.",
      notificationMessage: `Deleted ${cryptkeeperVerifiableCredentials.size} Verifiable Credential(s).`,
      notificationType: "basic",
      historyOperationType: OperationType.DELETE_ALL_VERIFIABLE_CREDENTIALS,
    });
  };

  handleVPRequest = async ({ request }: IVerifiablePresentationRequest): Promise<void> => {
    await this.browserController.openPopup({
      params: {
        redirect: Paths.GENERATE_VERIFIABLE_PRESENTATION_REQUEST,
        request,
      },
    });
  };

  announceVP = async (verifiablePresentation: IVerifiablePresentation): Promise<void> => {
    await this.announce({
      notificationTitle: "Verifiable Presentation generated.",
      notificationMessage: `Generated 1 Verifiable Presentation.`,
      notificationType: "basic",
      historyOperationType: OperationType.GENERATE_VERIFIABLE_PRESENTATION,
      responseType: EventName.GENERATE_VERIFIABLE_PRESENTATION,
      responsePayload: { verifiablePresentation },
    });
  };

  signAndAnnounceVP = async ({
    verifiablePresentation,
    address,
  }: IGenerateVerifiablePresentationWithCryptkeeperArgs): Promise<void> => {
    const serializedVerifiablePresentation = serializeVP(verifiablePresentation);
    const signature = await this.walletService.signMessage({
      message: serializedVerifiablePresentation,
      address,
    });
    const signedVerifiablePresentation = {
      ...verifiablePresentation,
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
      historyOperationType: OperationType.GENERATE_VERIFIABLE_PRESENTATION,
      responseType: EventName.GENERATE_VERIFIABLE_PRESENTATION,
      responsePayload: { verifiablePresentation: signedVerifiablePresentation },
    });
  };

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

  private insertCryptkeeperVCIntoStore = async (
    cryptkeeperVerifiableCredential: ICryptkeeperVerifiableCredential,
  ): Promise<void> => {
    const verifiableCredentialHash = cryptkeeperVerifiableCredential.metadata.hash;

    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCFromStore();

    if (cryptkeeperVerifiableCredentials.has(verifiableCredentialHash)) {
      await this.announce({
        notificationTitle: "Failed to add Verifiable Credential.",
        notificationMessage: `The Verifiable Credential you are trying to add already exists in your wallet.`,
        notificationType: "basic",
      });

      throw new Error("Verifiable Credential already exists.");
    }

    cryptkeeperVerifiableCredentials.set(
      verifiableCredentialHash,
      serializeCryptkeeperVC(cryptkeeperVerifiableCredential),
    );
    await this.writeCryptkeeperVC(cryptkeeperVerifiableCredentials);

    await this.announce({
      notificationTitle: "Verifiable Credential added.",
      notificationMessage: `Added 1 Verifiable Credential.`,
      notificationType: "basic",
      historyOperationType: OperationType.ADD_VERIFIABLE_CREDENTIAL,
      responseType: EventName.ADD_VERIFIABLE_CREDENTIAL,
      responsePayload: { verifiableCredentialHash },
    });
  };

  private getCryptkeeperVCFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.verifiableCredentialsStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const decryptedCredentials = this.cryptoService.decrypt(ciphertext, { mode: ECryptMode.MNEMONIC });
    const allCredentials = new Map(JSON.parse(decryptedCredentials) as [string, string][]);

    return allCredentials;
  };

  private writeCryptkeeperVC = async (cryptkeeperVerifiableCredentials: Map<string, string>): Promise<void> => {
    const serializedCredentials = JSON.stringify(Array.from(cryptkeeperVerifiableCredentials));
    const ciphertext = this.cryptoService.encrypt(serializedCredentials, { mode: ECryptMode.MNEMONIC });

    await this.verifiableCredentialsStore.set(ciphertext);
  };

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
      const tabs = await browser.tabs.query({ active: true });
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
      // this.browserController.pushEvent({ type: responseType, payload: responsePayload });
    }
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
    const cryptkeeperVerifiableCredentials = await this.getCryptkeeperVCFromStore();
    const mergedCredentials = new Map([...cryptkeeperVerifiableCredentials, ...backupCredentials]);

    await this.writeCryptkeeperVC(mergedCredentials);
  };
}
