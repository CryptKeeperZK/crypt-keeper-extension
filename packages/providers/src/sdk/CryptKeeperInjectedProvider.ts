import {
  ConnectedIdentityMetadata,
  ISemaphoreFullProof,
  ISemaphoreProofRequiredArgs,
  IRLNProofRequiredArgs,
  IRLNFullProof,
  IJoinGroupMemberArgs,
  IGenerateGroupMerkleProofArgs,
  IVerifiablePresentationRequest,
} from "@cryptkeeperzk/types";

import { RPCExternalAction } from "../constants";
import { Handler } from "../services";

import { ICryptKeeperInjectedProvider } from "./interface";

/**
 * Represents the CryptKeeper provider that is injected into the application.
 * This class is responsible for handling interactions with the CryptKeeper extension.
 *
 * @class
 */
export class CryptKeeperInjectedProvider extends Handler implements ICryptKeeperInjectedProvider {
  /**
   * Indicates whether the provider is CryptKeeper.
   */
  readonly isCryptKeeper = true;

  /**
   * Creates an instance of CryptKeeperInjectedProvider.
   *
   * @constructor
   */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(connectedOrigin?: string) {
    super(connectedOrigin);
  }

  async connectIdentity(): Promise<ConnectedIdentityMetadata> {
    return this.post({
      method: RPCExternalAction.INJECTOR_CONNECT_IDENTITY,
      payload: { urlOrigin: this.connectedOrigin },
    }) as Promise<ConnectedIdentityMetadata>;
  }

  async getConnectedIdentity(): Promise<ConnectedIdentityMetadata> {
    return this.post({
      method: RPCExternalAction.INJECTOR_GET_CONNECTED_IDENTITY_DATA,
    }) as Promise<ConnectedIdentityMetadata>;
  }

  async generateSemaphoreProof({
    externalNullifier,
    signal,
    merkleProofSource,
  }: ISemaphoreProofRequiredArgs): Promise<ISemaphoreFullProof> {
    return this.post({
      method: RPCExternalAction.INJECTOR_GENERATE_SEMAPHORE_PROOF,
      payload: {
        externalNullifier,
        signal,
        merkleProofSource,
      },
    }) as Promise<ISemaphoreFullProof>;
  }

  async generateRlnProof({
    rlnIdentifier,
    message,
    messageLimit,
    messageId,
    epoch,
    merkleProofSource,
  }: IRLNProofRequiredArgs): Promise<IRLNFullProof> {
    return this.post({
      method: RPCExternalAction.INJECTOR_GENERATE_RLN_PROOF,
      payload: {
        rlnIdentifier,
        message,
        messageId,
        messageLimit,
        epoch,
        merkleProofSource,
      },
    }) as Promise<IRLNFullProof>;
  }

  async joinGroup({ groupId, apiKey, inviteCode }: IJoinGroupMemberArgs): Promise<void> {
    await this.post({
      method: RPCExternalAction.JOIN_GROUP_REQUEST,
      payload: {
        groupId,
        apiKey,
        inviteCode,
      },
    });
  }

  async generateGroupMerkleProof({ groupId }: IGenerateGroupMerkleProofArgs): Promise<void> {
    await this.post({
      method: RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF_REQUEST,
      payload: {
        groupId,
      },
    });
  }

  /**
   * Requests user to reveal a connected identity commitment.
   *
   * @returns {Promise<void>}
   */
  async revealConnectedIdentityRequest(): Promise<void> {
    await this.post({
      method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT_REQUEST,
    });
  }

  /**
   * Requests user to provide a verifiable presentation.
   * NOTE: THIS FUNCTION IS UNDER DEVELOPMENT AND NOT READY FOR PRODUCTION USE
   *
   * @param {IVerifiablePresentationRequest} verifiablePresentationRequest - The information provided to the user when requesting a verifiable presentation.
   * @returns {void}
   */
  async DEV_generateVerifiablePresentationRequest(
    verifiablePresentationRequest: IVerifiablePresentationRequest,
  ): Promise<void> {
    await this.post({
      method: RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION_REQUEST,
      payload: verifiablePresentationRequest,
    });
  }

  /**
   * Requests user to reveal a connected identity commitment.
   * NOTE: THIS FUNCTION IS UNDER DEVELOPMENT AND NOT READY FOR PRODUCTION USE
   *
   * @param {string} serializedVerifiableCredential - The json string representation of the verifiable credential to add.
   * @returns {void}
   */
  async DEV_addVerifiableCredentialRequest(serializedVerifiableCredential: string): Promise<void> {
    await this.post({
      method: RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL_REQUEST,
      payload: serializedVerifiableCredential,
    });
  }
}
