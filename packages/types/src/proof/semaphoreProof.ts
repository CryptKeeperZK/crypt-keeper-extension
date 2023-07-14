import { FullProof } from "@semaphore-protocol/proof";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

import { MerkleProofArtifacts } from "./merkle";

export interface SemaphoreProof {
  fullProof: FullProof;
}

export interface SemaphoreProofRequest {
  identitySerialized: string;
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  merkleProofArtifacts?: MerkleProofArtifacts;
  merkleProof?: MerkleProof;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
}

export interface ISemaphoreGenerateArgs {
  identity: string;
  payload: SemaphoreProofRequest;
}
