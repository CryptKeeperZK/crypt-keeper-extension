import {
    Semaphore,
    MerkleProof,
    SemaphoreFullProof,
    SemaphoreSolidityProof,
    SemaphorePublicSignals,
    generateMerkleProof
} from '@zk-kit/protocols'
import { ZkIdentity } from '@zk-kit/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { MerkleProofArtifacts } from '@src/types'
import { SemaphoreProof, SemaphoreProofRequest } from './interfaces'
import { deserializeMerkleProof } from './utils'
import { Identity } from "@semaphore-protocol/identity";

export default class SemaphoreService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: Identity, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
        try {
            const {
                circuitFilePath,
                zkeyFilePath,
                merkleStorageAddress,
                externalNullifier,
                signal,
                merkleProofArtifacts,
                merkleProof: _merkleProof
            } = request
            let merkleProof: MerkleProof
            const identityCommitment = identity.generateCommitment()
            const identityCommitmentHex = bigintToHex(identityCommitment)

            if (_merkleProof) {
                merkleProof = _merkleProof
            } else if (merkleStorageAddress) {
                const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                    identityCommitment: identityCommitmentHex
                })

                merkleProof = deserializeMerkleProof(response.data.merkleProof)
            } else {
                const proofArtifacts = merkleProofArtifacts as MerkleProofArtifacts

                const leaves = proofArtifacts.leaves.map((leaf) => hexToBigint(leaf))
                merkleProof = generateMerkleProof(
                    proofArtifacts.depth,
                    BigInt(0),
                    leaves,
                    identityCommitment
                )
            }

            const witness = Semaphore.genWitness(
                identity.getTrapdoor(),
                identity.getNullifier(),
                merkleProof,
                externalNullifier,
                signal
            )

            const fullProof: SemaphoreFullProof = await Semaphore.genProof(witness, circuitFilePath, zkeyFilePath)

            const solidityProof: SemaphoreSolidityProof = Semaphore.packToSolidityProof(fullProof.proof)

            return {
                fullProof,
                solidityProof
            }
        } catch (e) {
            throw new Error(`Error while generating semaphore proof: ${e}`)
        }
    }
}
