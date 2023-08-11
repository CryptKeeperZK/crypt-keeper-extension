import { MerkleProof } from "@cryptkeeperzk/rln-proof";

import { ZkCircuit, ZkInputs } from "./zkProof";

export type { RLNFullProof, VerificationKey, RLNSNARKProof } from "@cryptkeeperzk/rln-proof";

/**
 * Represents the arguments required for generating an RLN proof.
 * This interface is intended to be used with the Cryptkeeper InjectedProvider.
 * @interface
 */
export interface IRlnProofRequiredArgs extends Partial<ZkInputs> {
  /**
   * The RLN identifier.
   * @type {string}
   */
  rlnIdentifier: string;

  /**
   * The message for the proof.
   * @type {string}
   */
  message: string;

  /**
   * The message limit for the proof.
   * @type {number}
   */
  messageLimit: number;

  /**
   * The message ID for the proof.
   * @type {number}
   */
  messageId: number;

  /**
   * The epoch for the proof.
   * @type {string}
   */
  epoch: string;
}

export interface IRlnProofRequest extends IRlnProofRequiredArgs, Partial<ZkCircuit> {
  identitySerialized?: string;
}

export interface IRlnGenerateArgs {
  identity: string;
  payload: IRlnProofRequest;
}

export interface IRlnProverInputs {
  rlnIdentifier: bigint;
  identitySecret: bigint;
  userMessageLimit: bigint;
  messageId: bigint;
  merkleProof: MerkleProof;
  messageHash: bigint;
  epoch: bigint;
}
