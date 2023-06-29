import {
  Approvals,
  IRlnGenerateArgs,
  ISemaphoreGenerateArgs,
  InjectedMessageData,
  InjectedProviderRequest,
  MerkleProofArtifacts,
  RLNFullProof,
  ConnectedIdentity,
  SemaphoreProof,
  ICreateIdentityRequestArgs,
  IConnectIdentityRequestArgs,
  HostPermission,
} from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, ZkProofService } from "@cryptkeeperzk/zk";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

import { RPCAction } from "../constants";
import EventEmitter, { EventHandler, EventName } from "../event";

const promises: {
  [k: string]: {
    resolve: (res?: unknown) => void;
    reject: (reason?: unknown) => void;
  };
} = {};

export class CryptKeeperInjectedProvider {
  readonly isCryptKeeper = true;

  private nonce: number;

  private zkProofService: ZkProofService;

  private emitter: EventEmitter;

  constructor() {
    this.nonce = 0;
    this.zkProofService = ZkProofService.getInstance();
    this.emitter = new EventEmitter();
  }

  on(eventName: EventName, cb: EventHandler): void {
    this.emitter.on(eventName, cb);
  }

  emit(eventName: EventName, payload?: unknown): void {
    this.emitter.emit(eventName, payload);
  }

  cleanListeners(): void {
    this.emitter.cleanListeners();
  }

  /**
   * Connect to Extension
   * @returns injected client or undefined if cryptkeeper is not installed
   */
  async connect(): Promise<CryptKeeperInjectedProvider | undefined> {
    if (!window.isCryptkeeperInjected) {
      return undefined;
    }

    const { isApproved, canSkipApprove } = await this.tryConnect(window.location.origin);

    if (isApproved) {
      await this.addHost(window.location.origin, canSkipApprove);
    }

    await this.post({ method: RPCAction.CLOSE_POPUP });

    const connectedIdentity = await this.getConnectedIdentity();

    if (!connectedIdentity?.commitment) {
      await this.connectIdentity({ host: window.location.origin });
    }

    return this;
  }

  private async tryConnect(host: string): Promise<Approvals> {
    return this.post({
      method: RPCAction.CONNECT,
      payload: { origin: host },
    }) as Promise<Approvals>;
  }

  // Connect injected script messages with content script messages
  // TODO: (#75) enhance by moving towards long-lived conenctions #75
  private async post(message: InjectedProviderRequest): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const messageNonce = this.nonce;
      this.nonce += 1;

      window.postMessage(
        {
          target: "injected-contentscript",
          message: {
            ...message,
            meta: {
              ...message.meta,
              origin: window.location.origin,
            },
            type: message.method,
          },
          nonce: messageNonce,
        },
        "*",
      );

      promises[messageNonce] = { resolve, reject };
    });
  }

  private async addHost(host: string, canSkipApprove: boolean): Promise<unknown> {
    return this.post({
      method: RPCAction.APPROVE_HOST,
      payload: { host, canSkipApprove },
    });
  }

  // Open Popup
  async openPopup(): Promise<unknown> {
    return this.post({
      method: "OPEN_POPUP",
    });
  }

  eventResponser = (event: MessageEvent<InjectedMessageData>): unknown => {
    const { data } = event;

    if (data && data.target === "injected-injectedscript") {
      if (data.nonce === "identityChanged") {
        const [, res] = data.payload;
        this.emit("identityChanged", res);
        return;
      }

      if (data.nonce === "logout") {
        const [, res] = data.payload;
        this.emit("logout", res);
        return;
      }

      if (data.nonce === "login") {
        const [, res] = data.payload;
        this.emit("login", res);
        return;
      }

      if (!promises[data.nonce]) {
        return;
      }

      const [err, res] = data.payload;
      const { resolve, reject } = promises[data.nonce];

      if (err) {
        reject(new Error(err));
        return;
      }

      resolve(res);

      delete promises[data.nonce];
    }
  };

  // dev-only
  async clearApproved(): Promise<unknown> {
    return this.post({
      method: RPCAction.CLEAR_APPROVED_HOSTS,
    });
  }

  async getIdentityCommitments(): Promise<unknown> {
    return this.post({
      method: RPCAction.GET_COMMITMENTS,
    });
  }

  async getConnectedIdentity(): Promise<ConnectedIdentity> {
    return this.post({
      method: RPCAction.GET_CONNECTED_IDENTITY_DATA,
    }) as Promise<ConnectedIdentity>;
  }

  async getHostPermissions(host: string): Promise<unknown> {
    return this.post({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: host,
    });
  }

  async setHostPermissions(host: string, permissions?: HostPermission): Promise<unknown> {
    return this.post({
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host,
        ...permissions,
      },
    });
  }

  async createIdentity({ host }: ICreateIdentityRequestArgs): Promise<void> {
    await this.post({
      method: RPCAction.CREATE_IDENTITY_REQUEST,
      payload: {
        host,
      },
    });
  }

  async connectIdentity({ host }: IConnectIdentityRequestArgs): Promise<void> {
    await this.post({
      method: RPCAction.CONNECT_IDENTITY_REQUEST,
      payload: {
        host,
      },
    });
  }

  async semaphoreProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    merkleProof?: MerkleProof,
  ): Promise<SemaphoreProof> {
    const merkleProofArtifacts =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

    const request = (await this.post({
      method: RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      payload: {
        externalNullifier,
        signal,
        merkleStorageAddress,
        merkleProofArtifacts,
        merkleProof,
      },
    })) as ISemaphoreGenerateArgs;

    return this.zkProofService.generateSemaphoreProof(
      ZkIdentitySemaphore.genFromSerialized(request.identity),
      request.payload,
    );
  }

  async rlnProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    rlnIdentifier: string,
  ): Promise<RLNFullProof> {
    const merkleProofArtifacts =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

    const request = (await this.post({
      method: RPCAction.PREPARE_RLN_PROOF_REQUEST,
      payload: {
        externalNullifier,
        signal,
        merkleStorageAddress,
        merkleProofArtifacts,
        rlnIdentifier,
      },
    })) as IRlnGenerateArgs;

    return this.zkProofService.generateRLNProof(
      ZkIdentitySemaphore.genFromSerialized(request.identity),
      request.payload,
    );
  }
}
