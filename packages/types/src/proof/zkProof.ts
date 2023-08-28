import { IMerkleProofArtifacts, IMerkleProof } from "./merkle";

export interface IZkCircuit {
  circuitFilePath: string;
  zkeyFilePath: string;
  verificationKey?: string;
}

export interface IZkInputs {
  merkleStorageAddress: string;
  merkleProofArtifacts: IMerkleProofArtifacts;
  merkleProofProvided: IMerkleProof;
  merkleProofArtifactsOrStorageAddress: string | IMerkleProofArtifacts;
}

// TODO: that is a redandant
export interface IZKProofPayload {
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
  urlOrigin: string;
}

export interface IZkMetadata {
  urlOrigin?: string;
}

export enum ZkProofType {
  SEMAPHORE,
  RLN,
}
