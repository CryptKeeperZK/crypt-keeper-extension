import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import log from "loglevel";

import { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";
import ZkProofService from "@src/background/services/zkProof";
import { RPCAction } from "@src/constants";
import {
  IRlnGenerateArgs,
  ISemaphoreGenerateArgs,
  InjectedMessageData,
  MerkleProofArtifacts,
  InjectedProviderRequest,
} from "@src/types";
import { SelectedIdentity } from "@src/ui/ducks/identities";

import { EventEmitter } from "./EventEmitter";
import { Approvals } from "./types";

const promises: {
  [k: string]: {
    resolve: (res?: unknown) => void;
    reject: (reason?: unknown) => void;
  };
} = {};

export class CryptKeeperInjectedProvider extends EventEmitter {
  private nonce: number;

  readonly isCryptKeeper = true;

  constructor() {
    super();
    this.nonce = 0;
  }

  /**
   * Connect to Extension
   * @returns injected client
   */
  async connect(): Promise<void> {
    try {
      const { isApproved, canSkipApprove } = await this.tryInject(window.location.origin);

      if (isApproved) {
        await this.addHost(window.location.origin, canSkipApprove);
      }
    } catch (err) {
      log.debug("Err: ", err);
    }

    await this.post({ method: RPCAction.CLOSE_POPUP });
  }

  private async tryInject(host: string): Promise<Approvals> {
    return this.post({
      method: RPCAction.TRY_INJECT,
      payload: { origin: host },
    }) as Promise<Approvals>;
  }

  // Connect injected script messages with content script messages
  // TODO: (#75) enhance by moving towards long-lived conenctions #75
  private async post(message: InjectedProviderRequest) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-plusplus
      const messageNonce = this.nonce++;
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

  private async addHost(host: string, noApproval: boolean) {
    return this.post({
      method: RPCAction.APPROVE_HOST,
      payload: { host, noApproval },
    });
  }

  // Open Popup
  async openPopup() {
    return this.post({
      method: "OPEN_POPUP",
    });
  }

  async eventResponser(event: MessageEvent<InjectedMessageData>) {
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
        // eslint-disable-next-line consistent-return
        return reject(new Error(err));
      }

      resolve(res);

      delete promises[data.nonce];
    }
  }

  // dev-only
  async clearApproved() {
    return this.post({
      method: RPCAction.CLEAR_APPROVED_HOSTS,
    });
  }

  async getIdentityCommitments() {
    return this.post({
      method: RPCAction.GET_COMMITMENTS,
    });
  }

  async getActiveIdentity() {
    return this.post({
      method: RPCAction.GET_ACTIVE_IDENTITY_DATA,
    }) as Promise<SelectedIdentity>;
  }

  async getHostPermissions(host: string) {
    return this.post({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: host,
    });
  }

  async setHostPermissions(
    host: string,
    permissions?: {
      noApproval?: boolean;
    },
  ) {
    return this.post({
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host,
        ...permissions,
      },
    });
  }

  async createIdentity() {
    return this.post({
      method: RPCAction.CREATE_IDENTITY_REQ,
    });
  }

  async semaphoreProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    merkleProof?: MerkleProof,
  ) {
    const merkleProofArtifacts =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

    const zkProofService = ZkProofService.getInstance();

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

    return zkProofService.generateSemaphoreProof(
      ZkIdentitySemaphore.genFromSerialized(request.identity),
      request.payload,
    );
  }

  async rlnProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    rlnIdentifier: string,
  ) {
    const merkleProofArtifacts =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

    const zkProofService = ZkProofService.getInstance();

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

    return zkProofService.generateRLNProof(ZkIdentitySemaphore.genFromSerialized(request.identity), request.payload);
  }
}
