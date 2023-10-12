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

import { EventHandler, EventName } from "../services";

/**
 * Represents the CryptKeeper provider that is injected into the application.
 * This class is responsible for handling interactions with the CryptKeeper extension.
 *
 * @interface
 */
export interface ICryptKeeperInjectedProvider {
  readonly isCryptKeeper: boolean;

  /**
   * Connects to the CryptKeeper extension.
   *
   * @returns {Promise<void>}
   */
  connect(isChangeIdentity?: boolean): Promise<void>;

  /**
   * Retrieves the connected identity.
   *
   * @returns {Promise<IConnectedIdentity>} A Promise that resolves to the connected identity.
   */
  getConnectedIdentity(): Promise<ConnectedIdentityMetadata | undefined>;

  /**
   * Generates a semaphore proof.
   *
   * @param {string} externalNullifier - The external nullifier.
   * @param {string} signal - The signal.
   * @param {MerkleProofSource} merkleProofSource - The merkle proof source weather it is a storage url, artifacts or merkle proof it self.
   *
   * @returns {Promise<SemaphoreFullProof>} A Promise that resolves to the semaphore proof.
   */
  generateSemaphoreProof({
    externalNullifier,
    signal,
    merkleProofSource,
  }: ISemaphoreProofRequiredArgs): Promise<ISemaphoreFullProof>;

  /**
   * Generates an RLN (Reputation Linked-Note) proof based on the provided RLN proof request.
   *
   * @param {string} rlnIdentifier - The RLN identifier as a string.
   * @param {string} message - The message content as a string.
   * @param {bigint | number} [messageLimit=1] - The message limit as a bigint or number. Defaults to 1 if not provided.
   * @param {bigint | number} [messageId=0] - The ID of the message as a bigint or number. Defaults to 0 if not provided.
   * @param {bigint | string} epoch - The epoch value as a bigint or string.
   * @param {MerkleProofSource} merkleProofSource - The merkle proof source weather it is a storage url, artifacts or merkle proof it self.
   *
   * @returns {Promise<RLNSNARKProof>} A Promise that resolves to the generated RLN proof.
   */
  generateRlnProof({
    rlnIdentifier,
    message,
    messageLimit,
    messageId,
    epoch,
    merkleProofSource,
  }: IRLNProofRequiredArgs): Promise<IRLNFullProof>;

  /**
   * Requests user to join a group with current connected identity.
   * @param {string} groupId - The group ID.
   * @param {string} apiKey - The Bandada API key (optional).
   * @param {string} inviteCode - The Bandada invite code (optional).
   *
   * @returns {Promise<void>}
   */
  joinGroup({ groupId, apiKey, inviteCode }: IJoinGroupMemberArgs): Promise<void>;

  /**
   * Requests user to generate a group Merkle proof with current connected identity.
   * @param {string} groupId - The group ID.
   * @returns {Promise<void>}
   */
  generateGroupMerkleProof({ groupId }: IGenerateGroupMerkleProofArgs): Promise<void>;

  /**
   * Requests user to add a verifiable credential.
   *
   * @param {string} serializedVerifiableCredential - The json string representation of the verifiable credential to add.
   * @returns {void}
   */
  DEV_addVerifiableCredentialRequest(serializedVerifiableCredential: string): Promise<void>;

  /**
   * Requests user to provide a verifiable presentation.
   * NOTE: THIS FUNCTION IS UNDER DEVELOPMENT AND NOT READY FOR PRODUCTION USE
   *
   * @param {IVerifiablePresentationRequest} verifiablePresentationRequest - The information provided to the user when requesting a verifiable presentation.
   * @returns {void}
   */
  DEV_generateVerifiablePresentationRequest(
    verifiablePresentationRequest: IVerifiablePresentationRequest,
  ): Promise<void>;

  /**
   * Requests user to reveal a connected identity commitment.
   *
   * @returns {Promise<void>}
   */
  revealConnectedIdentityRequest(): Promise<void>;

  /**
   * Registers an event listener for the specified event.
   *
   * @param {EventName} eventName - The name of the event to listen for.
   * @param {EventHandler} cb - The callback function to be called when the event is triggered.
   * @returns {void}
   */
  on(eventName: EventName, cb: EventHandler): void;

  /**
   * Emits an event with the specified name and optional payload.
   *
   * @param {EventName} eventName - The name of the event to emit.
   * @param {unknown} payload - The optional payload to include with the event.
   * @returns {void}
   */
  emit(eventName: EventName, payload?: unknown): void;

  /**
   * Removes all event listeners.
   *
   * @returns {void}
   */
  cleanListeners(): void;
}
