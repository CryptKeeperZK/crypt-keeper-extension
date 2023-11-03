import { EventName } from "@cryptkeeperzk/providers";
import { ZkIdentitySemaphore } from "@cryptkeeperzk/zk";
import { bigintToHex } from "bigint-conversion";
import omit from "lodash/omit";
import pick from "lodash/pick";

import BrowserUtils from "@src/background/controllers/browserUtils";
import { type BackupData, IBackupable } from "@src/background/services/backup";
import BaseService from "@src/background/services/base";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import SimpleStorage from "@src/background/services/storage";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { Paths } from "@src/constants";
import { OperationType } from "@src/types";

import type {
  IIdentityConnection,
  IZkMetadata,
  IConnectArgs,
  IRevealConnectedIdentityCommitmentArgs,
  IDeleteIdentityArgs,
} from "@cryptkeeperzk/types";

const CONNECTIONS_STORAGE_KEY = "@@CONNECTIONS@@";

export default class ConnectionService extends BaseService implements IBackupable {
  private static INSTANCE?: ConnectionService;

  private connections: Map<string, IIdentityConnection>;

  private readonly connectionsStorage: SimpleStorage;

  private readonly cryptoService: CryptoService;

  private readonly browserController: BrowserUtils;

  private readonly zkIdenityService: ZkIdentityService;

  private readonly historyService: HistoryService;

  private constructor() {
    super();
    this.connections = new Map();
    this.connectionsStorage = new SimpleStorage(CONNECTIONS_STORAGE_KEY);
    this.cryptoService = CryptoService.getInstance();
    this.browserController = BrowserUtils.getInstance();
    this.zkIdenityService = ZkIdentityService.getInstance();
    this.historyService = HistoryService.getInstance();
  }

  static getInstance = (): ConnectionService => {
    if (!ConnectionService.INSTANCE) {
      ConnectionService.INSTANCE = new ConnectionService();
    }

    return ConnectionService.INSTANCE;
  };

  lock = async (): Promise<boolean> => this.onLock(this.onClean);

  private onClean = (): boolean => {
    this.connections.clear();
    return true;
  };

  unlock = async (): Promise<boolean> => {
    const encryped = await this.connectionsStorage.get<string>();

    if (encryped) {
      const decrypted = this.cryptoService.decrypt(encryped, { mode: ECryptMode.MNEMONIC });
      this.connections = new Map(JSON.parse(decrypted) as Iterable<[string, IIdentityConnection]>);
    }

    this.isUnlocked = true;
    this.onUnlocked();

    return true;
  };

  connect = async ({ commitment }: IConnectArgs, { urlOrigin }: IZkMetadata): Promise<void> => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: origin is not provided");
    }

    const identity = this.zkIdenityService.getIdentity(commitment);

    if (!identity) {
      throw new Error("CryptKeeper: identity is not found");
    }

    const connection = { ...pick(identity.metadata, ["name"]), commitment, urlOrigin };
    this.connections.set(urlOrigin, connection);
    await this.save();

    await this.browserController.pushEvent(
      { type: EventName.CONNECT, payload: omit(connection, ["commitment"]) },
      { urlOrigin },
    );
  };

  disconnect = async (
    payload: Partial<IDeleteIdentityArgs> | undefined,
    { urlOrigin }: IZkMetadata,
  ): Promise<boolean> => {
    const connection =
      this.connections.get(urlOrigin!) ||
      [...this.connections.values()].find(({ commitment }) => commitment === payload?.identityCommitment);
    const connectionOrigin = connection?.urlOrigin;

    if (!connectionOrigin) {
      return false;
    }

    await this.isOriginConnected(payload, { urlOrigin: connectionOrigin });

    this.connections.delete(connectionOrigin);
    await this.save();

    await this.browserController.pushEvent(
      { type: EventName.DISCONNECT, payload: { urlOrigin: connectionOrigin } },
      { urlOrigin: connectionOrigin },
    );

    return true;
  };

  clear = async (): Promise<void> => {
    await Promise.all(
      [...this.connections.keys()].map((urlOrigin) =>
        this.browserController.pushEvent({ type: EventName.DISCONNECT, payload: { urlOrigin } }, { urlOrigin }),
      ),
    );

    this.connections.clear();
    await this.connectionsStorage.clear();
  };

  isOriginConnected = (payload: unknown, { urlOrigin }: IZkMetadata): unknown => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: origin is not provided");
    }

    const isConnected = this.connections.has(urlOrigin);

    if (!isConnected) {
      throw new Error("CryptKeeper: origin is not connected");
    }

    return payload;
  };

  getConnections = (): Record<string, IIdentityConnection> => Object.fromEntries(this.connections.entries());

  connectRequest = async (_: unknown, { urlOrigin }: IZkMetadata): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.CONNECT_IDENTITY, urlOrigin } });
  };

  getConnectedIdentity = (urlOrigin: string): ZkIdentitySemaphore | undefined => {
    const connection = this.connections.get(urlOrigin);

    if (!connection) {
      return undefined;
    }

    return this.zkIdenityService.getIdentity(connection.commitment);
  };

  revealConnectedIdentityCommitmentRequest = async (_: unknown, { urlOrigin }: IZkMetadata): Promise<void> => {
    await this.browserController.openPopup({
      params: { redirect: Paths.REVEAL_IDENTITY_COMMITMENT, urlOrigin },
    });
  };

  revealConnectedIdentityCommitment = async (
    { url }: IRevealConnectedIdentityCommitmentArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    const appOrigin = url || urlOrigin;
    const connectedIdentity = this.getConnectedIdentity(appOrigin!);

    if (!connectedIdentity) {
      throw new Error("CryptKeeper: No connected identity found");
    }

    const commitment = bigintToHex(connectedIdentity.genIdentityCommitment());

    await this.browserController.pushEvent(
      { type: EventName.REVEAL_COMMITMENT, payload: { commitment } },
      { urlOrigin: appOrigin },
    );

    await this.historyService.trackOperation(OperationType.REVEAL_IDENTITY_COMMITMENT, {
      identity: { commitment, metadata: connectedIdentity.metadata },
    });
  };

  downloadStorage = (): Promise<string | null> => this.connectionsStorage.get<string>();

  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (data && typeof data !== "string") {
      throw new Error("Incorrect restore format for connections");
    }

    await this.connectionsStorage.set(data);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const data = await this.connectionsStorage.get<string>();

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
      throw new Error("Incorrect backup format for connections");
    }

    const backup = this.cryptoService.decrypt(encryptedBackup, { secret: backupPassword });
    await this.unlock();

    const backupAllowedHosts = new Map(JSON.parse(backup) as Iterable<[string, IIdentityConnection]>);
    this.connections = new Map([...this.connections, ...backupAllowedHosts]);

    await this.save();
  };

  private async save(): Promise<void> {
    const serialized = JSON.stringify(Array.from(this.connections.entries()));
    const newData = this.cryptoService.encrypt(serialized, { mode: ECryptMode.MNEMONIC });
    await this.connectionsStorage.set(newData);
  }
}
