import { EventName } from "@cryptkeeperzk/providers";
import {
  IIdentityMetadata,
  ISetIdentityNameArgs,
  EWallet,
  INewIdentityRequest,
  ConnectedIdentityMetadata,
  ISetIdentityHostArgs,
  IConnectIdentityArgs,
  ICreateIdentityRequestArgs,
  IConnectIdentityRequestArgs,
  IZkMetadata,
} from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, createNewIdentity } from "@cryptkeeperzk/zk";
import { bigintToHex } from "bigint-conversion";
import pick from "lodash/pick";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import LockerService from "@src/background/services/lock";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/storage";
import WalletService from "@src/background/services/wallet";
import { Paths } from "@src/constants";
import { OperationType } from "@src/types";
import { setStatus } from "@src/ui/ducks/app";
import { setIdentities, setConnectedIdentity } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

import type { BackupData, IBackupable } from "@src/background/services/backup";

const IDENTITY_KEY = "@@ID@@";
const CONNECTED_IDENTITY_KEY = "@@CONNECTED-IDENTITY@@";

export default class ZkIdentityService implements IBackupable {
  private static INSTANCE?: ZkIdentityService;

  private identitiesStore: SimpleStorage;

  private connectedIdentityStore: SimpleStorage;

  private notificationService: NotificationService;

  private historyService: HistoryService;

  private browserController: BrowserUtils;

  private walletService: WalletService;

  private cryptoService: CryptoService;

  private lockService: LockerService;

  private connectedIdentity?: ZkIdentitySemaphore;

  private constructor() {
    this.connectedIdentity = undefined;
    this.identitiesStore = new SimpleStorage(IDENTITY_KEY);
    this.connectedIdentityStore = new SimpleStorage(CONNECTED_IDENTITY_KEY);
    this.notificationService = NotificationService.getInstance();
    this.historyService = HistoryService.getInstance();
    this.browserController = BrowserUtils.getInstance();
    this.walletService = WalletService.getInstance();
    this.cryptoService = CryptoService.getInstance();
    this.lockService = LockerService.getInstance();
  }

  static getInstance = (): ZkIdentityService => {
    if (!ZkIdentityService.INSTANCE) {
      ZkIdentityService.INSTANCE = new ZkIdentityService();
    }

    return ZkIdentityService.INSTANCE;
  };

  getConnectedIdentityCommitment = async (): Promise<string> => {
    const identity = await this.getConnectedIdentity();

    return identity ? bigintToHex(identity.genIdentityCommitment()) : "";
  };

  getConnectedIdentityData = async (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata | undefined> => {
    const identity = await this.getConnectedIdentity();

    if (!identity) {
      return undefined;
    }

    if (meta?.urlOrigin && identity.metadata.urlOrigin !== meta.urlOrigin) {
      return undefined;
    }

    return this.getConnectedIdentityMetadata(identity.metadata);
  };

  getConnectedIdentity = async (): Promise<ZkIdentitySemaphore | undefined> => {
    const identities = await this.getIdentitiesFromStore();

    return this.readConnectedIdentity(identities);
  };

  private readConnectedIdentity = async (identities: Map<string, string>) => {
    const connectedIdentityCommitmentCipher = await this.connectedIdentityStore.get<string>();

    if (!connectedIdentityCommitmentCipher) {
      return undefined;
    }

    const connectedIdentityCommitment = this.cryptoService.decrypt(connectedIdentityCommitmentCipher, {
      mode: ECryptMode.MNEMONIC,
    });
    const identity = identities.get(connectedIdentityCommitment);

    if (!identity) {
      return undefined;
    }

    this.connectedIdentity = ZkIdentitySemaphore.genFromSerialized(identity);

    return this.connectedIdentity;
  };

  private getIdentitiesFromStore = async (): Promise<Map<string, string>> => {
    const ciphertext = await this.identitiesStore.get<string>();

    if (!ciphertext) {
      return new Map();
    }

    const identitiesDecrypted = this.cryptoService.decrypt(ciphertext, { mode: ECryptMode.MNEMONIC });
    const iterableIdentities = JSON.parse(identitiesDecrypted) as Iterable<readonly [string, string]>;

    return new Map(iterableIdentities);
  };

  getIdentityCommitments = async (): Promise<{ commitments: string[]; identities: Map<string, string> }> => {
    const identities = await this.getIdentitiesFromStore();
    const commitments = [...identities.keys()];

    return { commitments, identities };
  };

  getIdentities = async (): Promise<{ commitment: string; metadata: IIdentityMetadata }[]> => {
    const { commitments, identities } = await this.getIdentityCommitments();

    return commitments
      .filter((commitment) => identities.has(commitment))
      .map((commitment) => {
        const serializedIdentity = identities.get(commitment)!;
        const identity = ZkIdentitySemaphore.genFromSerialized(serializedIdentity);

        return {
          commitment,
          metadata: identity.metadata,
        };
      });
  };

  getNumOfIdentities = async (): Promise<number> => {
    const identities = await this.getIdentitiesFromStore();
    return identities.size;
  };

  connectIdentity = async ({ urlOrigin, identityCommitment }: IConnectIdentityArgs): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    const result = await this.updateConnectedIdentity({ identities, identityCommitment, urlOrigin });

    if (result) {
      const status = await this.lockService.getStatus();
      await this.browserController
        .pushEvent(setStatus(status), { urlOrigin })
        .then(() => this.browserController.closePopup());
    }

    return result;
  };

  private updateConnectedIdentity = async ({
    identities,
    identityCommitment,
    urlOrigin,
  }: {
    identities: Map<string, string>;
    identityCommitment: string;
    urlOrigin?: string;
  }): Promise<boolean> => {
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    this.connectedIdentity = ZkIdentitySemaphore.genFromSerialized(identity);
    this.connectedIdentity.updateMetadata({ urlOrigin });
    await this.writeConnectedIdentity(identityCommitment, this.connectedIdentity.metadata);

    if (urlOrigin) {
      await this.setIdentityHost({ identityCommitment, urlOrigin });
    }

    return true;
  };

  private writeConnectedIdentity = async (commitment: string, metadata?: IIdentityMetadata): Promise<void> => {
    const ciphertext = this.cryptoService.encrypt(commitment, { mode: ECryptMode.MNEMONIC });
    await this.connectedIdentityStore.set(ciphertext);
    const connectedMetadata = this.getConnectedIdentityMetadata(metadata);

    await Promise.all([
      this.browserController.pushEvent(setConnectedIdentity(connectedMetadata), {
        urlOrigin: connectedMetadata?.urlOrigin,
      }),
      pushMessage(setConnectedIdentity(connectedMetadata)),
    ]);
  };

  private getConnectedIdentityMetadata(metadata?: IIdentityMetadata): ConnectedIdentityMetadata | undefined {
    if (!metadata) {
      return undefined;
    }

    return pick(metadata, ["name", "urlOrigin"]);
  }

  setIdentityName = async ({ identityCommitment, name }: ISetIdentityNameArgs): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(rawIdentity);
    identity.updateMetadata({ name });
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  setIdentityHost = async ({ identityCommitment, urlOrigin }: ISetIdentityHostArgs): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const rawIdentity = identities.get(identityCommitment);

    if (!rawIdentity) {
      return false;
    }

    const identity = ZkIdentitySemaphore.genFromSerialized(rawIdentity);
    identity.updateMetadata({ urlOrigin });
    identities.set(identityCommitment, identity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();

    return true;
  };

  unlock = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identity = await this.readConnectedIdentity(identities);
    const identityCommitment = identity ? bigintToHex(identity.genIdentityCommitment()) : undefined;

    if (identityCommitment) {
      await this.updateConnectedIdentity({
        identities,
        identityCommitment,
        urlOrigin: identity?.metadata.urlOrigin,
      });
    }

    return true;
  };

  private clearConnectedIdentity = async (): Promise<void> => {
    if (!this.connectedIdentity) {
      return;
    }

    this.connectedIdentity = undefined;
    await this.writeConnectedIdentity("");
  };

  createIdentityRequest = async ({ urlOrigin }: ICreateIdentityRequestArgs): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CREATE_IDENTITY, urlOrigin } });
  };

  connectIdentityRequest = async ({ urlOrigin }: IConnectIdentityRequestArgs): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CONNECT_IDENTITY, urlOrigin } });
  };

  revealConnectedIdentityCommitmentRequest = async (): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.REVEAL_IDENTITY_COMMITMENT } });
  };

  revealConnectedIdentityCommitment = async (): Promise<void> => {
    const connectedIdentity = await this.getConnectedIdentity();

    if (!connectedIdentity) {
      throw new Error("No connected identity found");
    }

    const commitment = bigintToHex(connectedIdentity.genIdentityCommitment());

    await this.browserController.pushEvent(
      { type: EventName.REVEAL_COMMITMENT, payload: { commitment } },
      { urlOrigin: connectedIdentity.metadata.urlOrigin! },
    );

    await this.historyService.trackOperation(OperationType.REVEAL_IDENTITY_COMMITMENT, {
      identity: { commitment, metadata: connectedIdentity.metadata },
    });
  };

  createIdentity = async ({
    walletType,
    messageSignature,
    isDeterministic,
    groups,
    urlOrigin,
    options,
  }: INewIdentityRequest): Promise<string | undefined> => {
    const numOfIdentities = await this.getNumOfIdentities();

    const config = {
      ...options,
      groups,
      urlOrigin,
      isDeterministic,
      nonce: isDeterministic ? options.nonce : undefined,
      name: options.name || `Account # ${numOfIdentities}`,
      messageSignature,
    };

    if (walletType === EWallet.CRYPTKEEPER_WALLET && isDeterministic) {
      config.messageSignature = await this.walletService.signMessage({
        message: options.message,
        address: options.account,
      });
    }

    const identity = createNewIdentity(config);
    const status = await this.insertIdentity(identity);

    if (!status) {
      throw new Error("Identity is already exist. Try to change nonce or identity data.");
    }

    return bigintToHex(identity.genIdentityCommitment());
  };

  private insertIdentity = async (newIdentity: ZkIdentitySemaphore): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();
    const identityCommitment = bigintToHex(newIdentity.genIdentityCommitment());

    if (identities.has(identityCommitment)) {
      return false;
    }

    identities.set(identityCommitment, newIdentity.serialize());
    await this.writeIdentities(identities);
    await this.refresh();
    await this.historyService.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: { commitment: identityCommitment, metadata: newIdentity.metadata },
    });

    await this.notificationService.create({
      options: {
        title: "New identity has been created.",
        message: `Identity commitment: ${ellipsify(identityCommitment)}`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  private writeIdentities = async (identities: Map<string, string>): Promise<void> => {
    const serializedIdentities = JSON.stringify(Array.from(identities.entries()));
    const ciphertext = this.cryptoService.encrypt(serializedIdentities, { mode: ECryptMode.MNEMONIC });
    await this.identitiesStore.set(ciphertext);
  };

  private refresh = async (): Promise<void> => {
    const identities = await this.getIdentities();
    await pushMessage(setIdentities(identities));
  };

  deleteIdentity = async (payload: { identityCommitment: string }): Promise<boolean> => {
    const { identityCommitment } = payload;
    const identities = await this.getIdentitiesFromStore();
    const identity = identities.get(identityCommitment);

    if (!identity) {
      return false;
    }

    identities.delete(identityCommitment);
    await this.writeIdentities(identities);
    await this.historyService.trackOperation(OperationType.DELETE_IDENTITY, {
      identity: {
        commitment: identityCommitment,
        metadata: ZkIdentitySemaphore.genFromSerialized(identity).metadata,
      },
    });

    await this.refresh();

    return true;
  };

  deleteAllIdentities = async (): Promise<boolean> => {
    const identities = await this.getIdentitiesFromStore();

    if (!identities.size) {
      return false;
    }

    await Promise.all([this.clearConnectedIdentity(), this.identitiesStore.clear(), pushMessage(setIdentities([]))]);
    await this.historyService.trackOperation(OperationType.DELETE_ALL_IDENTITIES, {});

    await this.notificationService.create({
      options: {
        title: "Identities removed",
        message: `Identity storage has been cleared`,
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return true;
  };

  downloadStorage = (): Promise<string | null> => this.identitiesStore.get<string>();

  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (data && typeof data !== "string") {
      throw new Error("Incorrect restore format for identities");
    }

    await this.identitiesStore.set(data);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const data = await this.identitiesStore.get<string>();

    if (!data) {
      return null;
    }

    const backup = this.cryptoService.decrypt(data, { mode: ECryptMode.MNEMONIC });
    const encryptedBackup = this.cryptoService.encrypt(backup, { secret: backupPassword });

    return this.cryptoService.generateEncryptedHmac(encryptedBackup, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: BackupData, backupPassword: string): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    const encryptedBackup = this.cryptoService.getAuthenticBackup(backupEncryptedData, backupPassword);

    if (typeof encryptedBackup !== "string") {
      throw new Error("Incorrect backup format for identities");
    }

    const backup = this.cryptoService.decrypt(encryptedBackup, { secret: backupPassword });

    const backupIdentities = new Map(JSON.parse(backup) as Iterable<readonly [string, string]>);
    const identities = await this.getIdentitiesFromStore();
    const mergedIdentities = new Map([...identities, ...backupIdentities]);

    await this.writeIdentities(mergedIdentities);
  };
}
