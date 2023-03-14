import { FullProof } from "@semaphore-protocol/proof";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

import { MerkleProofArtifacts, PendingRequestOrigin } from "@src/types";

export interface SemaphoreProofRequest extends PendingRequestOrigin {
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
  merkleProofArtifacts?: MerkleProofArtifacts;
  merkleProof?: MerkleProof;
}

export interface RLNProofRequest extends SemaphoreProofRequest {
  rlnIdentifier: string;
}

export interface SemaphoreProof {
  fullProof: FullProof;
}
