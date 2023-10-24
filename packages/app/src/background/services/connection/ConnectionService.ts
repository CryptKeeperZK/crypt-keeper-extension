import { EventName } from "@cryptkeeperzk/providers";
import omit from "lodash/omit";
import pick from "lodash/pick";

import BrowserUtils from "@src/background/controllers/browserUtils";
import { type BackupData, IBackupable } from "@src/background/services/backup";
import BaseService from "@src/background/services/base";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import SimpleStorage from "@src/background/services/storage";
import ZkIdentityService from "@src/background/services/zkIdentity";

import type { IIdenityConnection, IZkMetadata, IConnectArgs, IIdentityMetadata } from "@cryptkeeperzk/types";

const CONNECTIONS_STORAGE_KEY = "@@CONNECTIONS@@";

export default class ConnectionService extends BaseService implements IBackupable {
  private static INSTANCE?: ConnectionService;

  private connections: Map<string, IIdenityConnection>;

  private readonly connectionsStorage: SimpleStorage;

  private readonly cryptoService: CryptoService;

  private readonly browserController: BrowserUtils;

  private readonly zkIdenityService: ZkIdentityService;

  private constructor() {
    super();
    this.connections = new Map();
    this.connectionsStorage = new SimpleStorage(CONNECTIONS_STORAGE_KEY);
    this.cryptoService = CryptoService.getInstance();
    this.browserController = BrowserUtils.getInstance();
    this.zkIdenityService = ZkIdentityService.getInstance();
  }

  static getInstance = (): ConnectionService => {
    if (!ConnectionService.INSTANCE) {
      ConnectionService.INSTANCE = new ConnectionService();
    }

    return ConnectionService.INSTANCE;
  };

  lock = (): Promise<boolean> => this.onLock();

  unlock = async (): Promise<boolean> => {
    const encryped = await this.connectionsStorage.get<string>();

    if (encryped) {
      const decrypted = this.cryptoService.decrypt(encryped, { mode: ECryptMode.MNEMONIC });
      this.connections = new Map(JSON.parse(decrypted) as Iterable<[string, IIdenityConnection]>);
    }

    this.isUnlocked = true;
    this.onUnlocked();

    return true;
  };

  connect = async ({ commitment }: IConnectArgs, { urlOrigin }: IZkMetadata): Promise<void> => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: origin is not provided");
    }

    const idenity = await this.zkIdenityService.getIdentity(commitment);

    if (!idenity) {
      throw new Error("CryptKeeper: identity is not found");
    }

    const connection = this.getIdentityConnection(commitment, idenity.metadata);
    this.connections.set(urlOrigin, connection);
    await this.save();

    await this.browserController.pushEvent(
      { type: EventName.CONNECT_IDENTITY, payload: omit(connection, ["commitment"]) },
      { urlOrigin },
    );
  };

  disconnect = async (payload: unknown, { urlOrigin }: IZkMetadata): Promise<void> => {
    await this.isOriginConnected(payload, { urlOrigin });
    this.connections.delete(urlOrigin!);
    await this.save();

    await this.browserController.pushEvent(
      { type: EventName.DISCONNECT_IDENTITY, payload: { urlOrigin } },
      { urlOrigin },
    );
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

  getConnections = (): Map<string, IIdenityConnection> => this.connections;

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

    const backupAllowedHosts = new Map(JSON.parse(backup) as Iterable<[string, IIdenityConnection]>);
    this.connections = new Map([...this.connections, ...backupAllowedHosts]);

    await this.save();
  };

  private getIdentityConnection(commitment: string, metadata: IIdentityMetadata): IIdenityConnection {
    return {
      ...pick(metadata, ["name", "urlOrigin"]),
      commitment,
    };
  }

  private async save(): Promise<void> {
    const serialized = JSON.stringify(Array.from(this.connections.entries()));
    const newData = this.cryptoService.encrypt(serialized, { mode: ECryptMode.MNEMONIC });
    await this.connectionsStorage.set(newData);
  }
}
