import { FullProof } from "@cryptkeeperzk/semaphore-proof";

import { IZkMetadata, ZkCircuit, ZkInputs } from "./zkProof";

export type SemaphoreFullProof = FullProof;

/**
 * Represents the arguments required for generating a Semaphore proof.
 * This interface is intended to be used with the Cryptkeeper InjectedProvider.
 * @interface
 */
export interface ISemaphoreProofRequiredArgs extends Partial<ZkInputs> {
  /**
   * The external nullifier for the proof.
   * @type {string}
   */
  externalNullifier: string;

  /**
   * The signal for the proof.
   * @type {string}
   */
  signal: string;
}

export interface ISemaphoreProofRequest extends ISemaphoreProofRequiredArgs, IZkMetadata, Partial<ZkCircuit> {
  identitySerialized?: string;
}

export interface ISemaphoreGenerateArgs {
  identity: string;
  payload: ISemaphoreProofRequest;
}
