import { MerkleProof, SemaphoreFullProof, SemaphoreSolidityProof } from '@zk-kit/protocols'
import { MerkleProofArtifacts } from '@src/types'

export enum Protocol {
    SEMAPHORE,
    RLN,
    NRLN
}

export interface SemaphoreProofRequest {
    externalNullifier: string
    signal: string
    merkleStorageAddress?: string
    circuitFilePath: string
    zkeyFilePath: string
    merkleProofArtifacts?: MerkleProofArtifacts
    merkleProof?: MerkleProof
}

export interface RLNProofRequest extends SemaphoreProofRequest {
    rlnIdentifier: string
}

export interface SemaphoreProof {
    fullProof: SemaphoreFullProof
    solidityProof: SemaphoreSolidityProof
}
