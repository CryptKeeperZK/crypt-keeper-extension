import { MerkleProofArtifacts, MerkleProof } from "./merkle";

export interface ZkCircuit {
  circuitFilePath: string;
  zkeyFilePath: string;
  verificationKey?: string;
}

export interface ZkInputs {
  merkleStorageAddress: string;
  merkleProofArtifacts: MerkleProofArtifacts;
  merkleProofProvided: MerkleProof;
  merkleProofArtifactsOrStorageAddress: string | MerkleProofArtifacts;
}

export interface ZKProofPayload {
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
  origin: string;
}

export enum ZkProofType {
  SEMAPHORE,
  RLN,
}
