import {
  Approvals,
  IRlnGenerateArgs,
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
import { EventEmitter, EventHandler, EventName } from "../event";

/**
 * Stores promises associated with message nonces.
 */
const promises = new Map<string, Handlers>();

interface Handlers {
  resolve: (res?: unknown) => void;
  reject: (reason?: unknown) => void;
}

/**
 * Represents the CryptKeeper provider that is injected into the application.
 * This class is responsible for handling interactions with the CryptKeeper extension.
 *
 * @class
 */
export class CryptKeeperInjectedProvider {
  /**
   * Indicates whether the provider is CryptKeeper.
   */
  readonly isCryptKeeper = true;

  /**
   * Nonce used for message communication.
   */
  private nonce: number;

  /**
   * ZkProofService instance for generating zero-knowledge proofs.
   */
  private zkProofService: ZkProofService;

  /**
   * EventEmitter for handling events.
   */
  private emitter: EventEmitter;

  /**
   * Creates an instance of CryptKeeperInjectedProvider.
   *
   * @constructor
   */
  constructor() {
    this.nonce = 0;
    this.zkProofService = ZkProofService.getInstance();
    this.emitter = new EventEmitter();
  }

  /**
   * Registers an event listener for the specified event.
   *
   * @param {EventName} eventName - The name of the event to listen for.
   * @param {EventHandler} cb - The callback function to be called when the event is triggered.
   * @returns {void}
   */
  on(eventName: EventName, cb: EventHandler): void {
    this.emitter.on(eventName, cb);
  }

  /**
   * Emits an event with the specified name and optional payload.
   *
   * @param {EventName} eventName - The name of the event to emit.
   * @param {unknown} payload - The optional payload to include with the event.
   * @returns {void}
   */
  emit(eventName: EventName, payload?: unknown): void {
    this.emitter.emit(eventName, payload);
  }

  /**
   * Removes all event listeners.
   *
   * @returns {void}
   */
  cleanListeners(): void {
    this.emitter.cleanListeners();
  }

  /**
   * Connects to the CryptKeeper extension.
   *
   * @returns {Promise<CryptKeeperInjectedProvider | undefined>} A Promise that resolves to the connected CryptKeeperInjectedProvider instance, or undefined if the CryptKeeper extension is not installed.
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

    if (!connectedIdentity.commitment) {
      await this.connectIdentity({ host: window.location.origin });
    }

    return this;
  }

  /**
   * Attempts to connect to the extension.
   *
   * @param {string} host - The host origin to connect to.
   * @returns {Promise<Approvals>} A Promise that resolves to an object containing approval information.
   */
  private async tryConnect(host: string): Promise<Approvals> {
    return this.post({
      method: RPCAction.CONNECT,
      payload: { origin: host },
    }) as Promise<Approvals>;
  }

  /**
   * Sends a message to the extension.
   *
   * @param {InjectedProviderRequest} message - The message to send.
   * @returns {Promise<unknown>} A Promise that resolves to the response from the extension.
   */
  private async post(message: InjectedProviderRequest): Promise<unknown> {
    // TODO: (#75) enhance by moving towards long-lived conenctions #75
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

      promises.set(messageNonce.toString(), { resolve, reject });
    });
  }

  /**
   * Adds a host to the approved list.
   *
   * @param {string} host - The host to add.
   * @param {boolean} canSkipApprove - Specifies whether the approval can be skipped.
   * @returns {Promise<unknown>} A Promise that resolves to the result of adding the host.
   */
  private async addHost(host: string, canSkipApprove: boolean): Promise<unknown> {
    return this.post({
      method: RPCAction.APPROVE_HOST,
      payload: { host, canSkipApprove },
    });
  }

  /**
   * Retrieves the connected identity.
   *
   * @returns {Promise<ConnectedIdentity>} A Promise that resolves to the connected identity.
   */
  async getConnectedIdentity(): Promise<ConnectedIdentity> {
    return this.post({
      method: RPCAction.GET_CONNECTED_IDENTITY_DATA,
    }) as Promise<ConnectedIdentity>;
  }

  /**
   * Connects to an existing identity for the specified host.
   *
   * @param {IConnectIdentityRequestArgs} host - The host for which to connect to an identity.
   * @returns {Promise<void>} A Promise that resolves when the connection is complete.
   */
  async connectIdentity({ host }: IConnectIdentityRequestArgs): Promise<void> {
    await this.post({
      method: RPCAction.CONNECT_IDENTITY_REQUEST,
      payload: {
        host,
      },
    });
  }

  /**
   * Handles incoming messages from the extension.
   *
   * @param {InjectedMessageData} event - The message event.
   * @returns {unknown} The result of handling the event.
   */
  eventResponser = (event: MessageEvent<InjectedMessageData>): unknown => {
    const { data } = event;

    if (data.target === "injected-injectedscript") {
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

      if (!promises.has(data.nonce.toString())) {
        return;
      }

      const [err, res] = data.payload;
      const { reject, resolve } = promises.get(data.nonce.toString())!;

      if (err) {
        reject(new Error(err));
        return;
      }

      resolve(res);

      promises.delete(data.nonce.toString());
    }
  };

  /**
   * Retrieves the identity commitments.
   *
   * @returns {Promise<unknown>} A Promise that resolves to the identity commitments.
   */
  async getIdentityCommitments(): Promise<unknown> {
    return this.post({
      method: RPCAction.GET_COMMITMENTS,
    });
  }

  /**
   * Retrieves the host permissions for the specified host.
   *
   * @param {string} host - The host for which to retrieve the permissions.
   * @returns {Promise<unknown>} A Promise that resolves to the host permissions.
   */
  async getHostPermissions(host: string): Promise<unknown> {
    return this.post({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: host,
    });
  }

  /**
   * Sets the host permissions for the specified host.
   *
   * @param {striing} host - The host for which to set the permissions.
   * @param {HostPermission} permissions - The host permissions to set.
   * @returns {Promise<unknown>} A Promise that resolves to the result of setting the host permissions.
   */
  async setHostPermissions(host: string, permissions?: HostPermission): Promise<unknown> {
    return this.post({
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host,
        ...permissions,
      },
    });
  }

  /**
   * Creates an identity for the specified host.
   *
   * @param {ICreateIdentityRequestArgs} host - The host for which to create an identity.
   * @returns {Promise<void>} A Promise that resolves when the identity creation is complete.
   */
  async createIdentity({ host }: ICreateIdentityRequestArgs): Promise<void> {
    await this.post({
      method: RPCAction.CREATE_IDENTITY_REQUEST,
      payload: {
        host,
      },
    });
  }

  /**
   * Generates a semaphore proof.
   *
   * @param {string} externalNullifier - The external nullifier.
   * @param {string} signal - The signal.
   * @param {string | MerkleProofArtifacts} merkleProofArtifactsOrStorageAddress - The merkle proof artifacts or storage address.
   * @param {MerkleProof} merkleProof - The merkle proof (optional).
   * @returns {Promise<SemaphoreProof>} A Promise that resolves to the semaphore proof.
   */
  async generateSemaphoreProof(
    externalNullifier: string,
    signal: string,
    merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts,
    merkleProof?: MerkleProof,
  ): Promise<SemaphoreProof | void> {
    const merkleProofArtifacts =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? undefined : merkleProofArtifactsOrStorageAddress;
    const merkleStorageAddress =
      typeof merkleProofArtifactsOrStorageAddress === "string" ? merkleProofArtifactsOrStorageAddress : undefined;

    return (await this.post({
      method: RPCAction.GENERATE_SEMAPHORE_PROOF,
      payload: {
        externalNullifier,
        signal,
        merkleStorageAddress,
        merkleProofArtifacts,
        merkleProof,
      },
      source: "offscreen",
    })) as Promise<SemaphoreProof>;
  }

  /**
   * Generates an RLN proof.
   *
   * @param {string} externalNullifier - The external nullifier.
   * @param {string} signal - The signal.
   * @param {string | MerkleProofArtifacts} merkleProofArtifactsOrStorageAddress - The merkle proof artifacts or storage address.
   * @param {string} rlnIdentifier - The RLN identifier.
   * @returns {Promise<RLNFullProof>} A Promise that resolves to the RLN proof.
   */
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
