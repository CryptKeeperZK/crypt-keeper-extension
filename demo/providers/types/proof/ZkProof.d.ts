import { MerkleProofArtifacts, MerkleProof } from "./Merkle";
export declare type ZkInputs = {
    merkleStorageAddress?: string;
    merkleProofArtifacts?: MerkleProofArtifacts;
    merkleProof?: MerkleProof;
};
export interface ZKProofPayload {
    externalNullifier: string;
    signal: string;
    merkleStorageAddress?: string;
    circuitFilePath: string;
    verificationKey: string;
    zkeyFilePath: string;
    origin: string;
}
export declare enum ZkProofType {
    SEMAPHORE = 0,
    RLN = 1
}
