import { IZkMetadata, IZkCircuit, IMerkleProofInputs } from "./zkProof";

export type { FullProof as ISemaphoreFullProof } from "@cryptkeeperzk/semaphore-proof";

/**
 * Represents the arguments required for generating a Semaphore proof.
 * This interface is intended to be used with the Cryptkeeper InjectedProvider.
 * @interface
 */
export interface ISemaphoreProofRequiredArgs extends Partial<IMerkleProofInputs> {
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

export interface ISemaphoreProofRequest extends ISemaphoreProofRequiredArgs, IZkMetadata, Partial<IZkCircuit> {
  identitySerialized?: string;
}

export interface ISemaphoreGenerateArgs {
  identity: string;
  payload: ISemaphoreProofRequest;
}
