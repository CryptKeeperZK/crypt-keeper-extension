import {
    generateMerkleProof
} from '@zk-kit/protocols';
import { generateProof, FullProof, packToSolidityProof, SolidityProof } from '@semaphore-protocol/proof';
import { Identity } from "@semaphore-protocol/identity";
import { MerkleProof } from '@zk-kit/incremental-merkle-tree';
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { MerkleProofArtifacts } from '@src/types'
import { SemaphoreProof, SemaphoreProofRequest } from './interfaces'
import { deserializeMerkleProof } from './utils'

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

                // 1. Create a tree
                // const tree = createTree(proofArtifacts.depth, )

                // 2. Create a proof
                // TODO: replace `generateMerkleProof()` with `incrementalMerkleTree.createProof()` 
                merkleProof = generateMerkleProof(
                    proofArtifacts.depth,
                    BigInt(0),
                    leaves,
                    identityCommitment
                )
            }

            // TODO: do we need to leave `SnarkArtifacts` param as undefinded?
            const fullProof: FullProof = await generateProof(identity, merkleProof, externalNullifier, signal, {
                wasmFilePath: circuitFilePath, 
                zkeyFilePath: zkeyFilePath
            });

            const solidityProof: SolidityProof = packToSolidityProof(fullProof.proof)

            return {
                fullProof,
                solidityProof
            }
        } catch (e) {
            throw new Error(`Error while generating semaphore proof: ${e}`)
        }
    }
}
