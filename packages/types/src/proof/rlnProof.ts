import type { MerkleProof } from "@cryptkeeperzk/rlnjs";

import { IZkMetadata, IZkCircuit, IMerkleProofInputs } from "./zkProof";

export type { VerificationKey as IRLNVerificationKey, RLNSNARKProof as IRLNFullProof } from "@cryptkeeperzk/rlnjs";

/**
 * Represents the arguments required for generating an RLN proof.
 * This interface is intended to be used with the Cryptkeeper InjectedProvider.
 * @interface
 */
export interface IRLNProofRequiredArgs extends Partial<IMerkleProofInputs> {
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

export interface IRLNProofRequest extends IRLNProofRequiredArgs, IZkMetadata, Partial<IZkCircuit> {
  identitySerialized?: string;
}

export interface IRLNGenerateArgs {
  identity: string;
  payload: IRLNProofRequest;
}

export interface IRLNProverInputs {
  rlnIdentifier: bigint;
  identitySecret: bigint;
  userMessageLimit: bigint;
  messageId: bigint;
  merkleProof: MerkleProof;
  x: bigint;
  epoch: bigint;
}
