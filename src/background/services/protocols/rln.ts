import { RLN, MerkleProof, RLNFullProof, generateMerkleProof } from '@zk-kit/protocols'
import { ZkIdentity } from '@zk-kit/identity'
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { MerkleProofArtifacts } from '@src/types'
import { RLNProofRequest } from './interfaces'
import { deserializeMerkleProof } from './utils'

export default class RLNService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: ZkIdentity, request: RLNProofRequest): Promise<RLNFullProof> {
        try {
            const {
                circuitFilePath,
                zkeyFilePath,
                merkleStorageAddress,
                externalNullifier,
                signal,
                merkleProofArtifacts,
                rlnIdentifier
            } = request
            let merkleProof: MerkleProof

            const identitySecretHash: bigint = identity.getSecretHash()
            const identityCommitment = identity.genIdentityCommitment()
            const identityCommitmentHex = bigintToHex(identityCommitment)
            const rlnIdentifierBigInt = hexToBigint(rlnIdentifier)
            if (merkleStorageAddress) {
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
                    proofArtifacts.leavesPerNode,
                    leaves,
                    identityCommitment
                )
            }

            const witness = RLN.genWitness(
                identitySecretHash,
                merkleProof,
                externalNullifier,
                signal,
                rlnIdentifierBigInt
            )
            const fullProof: RLNFullProof = await RLN.genProof(witness, circuitFilePath, zkeyFilePath)
            return fullProof
        } catch (e) {
            throw new Error(`Error while generating RLN proof: ${e}`)
        }
    }
}
