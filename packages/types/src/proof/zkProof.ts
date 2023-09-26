import { IMerkleProofArtifacts, IMerkleProof } from "./merkle";

export interface IZkCircuit {
  circuitFilePath: string;
  zkeyFilePath: string;
  verificationKey?: string;
}

export type MerkleProofStorageUrl = string;

export type MerkleProofSource = MerkleProofStorageUrl | IMerkleProofArtifacts | IMerkleProof;

export interface IMerkleProofInputs {
  merkleProofSource: MerkleProofSource;
  merkleStorageUrl?: MerkleProofStorageUrl;
  merkleProofArtifacts?: IMerkleProofArtifacts;
  merkleProofProvided?: IMerkleProof;
}

// TODO: that is a redandant
export interface IZKProofPayload {
  externalNullifier: string;
  signal: string;
  merkleStorageUrl?: string;
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
