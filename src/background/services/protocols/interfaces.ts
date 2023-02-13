import { FullProof } from "@semaphore-protocol/proof";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { MerkleProofArtifacts } from "@src/types";

export enum Protocol {
  SEMAPHORE,
  RLN,
  NRLN,
}

export interface SemaphoreProofRequest {
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
