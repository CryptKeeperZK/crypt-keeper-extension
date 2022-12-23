import { MerkleProof } from '@zk-kit/incremental-merkle-tree';
import { Identity } from "@semaphore-protocol/identity";
import { RLN,  RLNFullProof  } from 'rlnjs/src';
import { bigintToHex, hexToBigint } from 'bigint-conversion'
import axios, { AxiosResponse } from 'axios'
import { MerkleProofArtifacts } from '@src/types'
import { RLNProofRequest } from './interfaces'
import { deserializeMerkleProof, generateMerkleProoof } from './utils'

export default class RLNService {
    // eslint-disable-next-line class-methods-use-this
    async genProof(identity: Identity, request: RLNProofRequest): Promise<RLNFullProof> {
        try {
            const {
                circuitFilePath,
                zkeyFilePath,
                verificationKey,
                merkleStorageAddress,
                externalNullifier,
                signal,
                merkleProofArtifacts,
                rlnIdentifier
            } = request
            let merkleProof: MerkleProof

            const rln = new RLN(circuitFilePath, zkeyFilePath, verificationKey);

            const identityCommitment = identity.getCommitment()
            const identityCommitmentHex = bigintToHex(identityCommitment)
            const rlnIdentifierBigInt = hexToBigint(rlnIdentifier)
            if (merkleStorageAddress) {
                const response: AxiosResponse = await axios.post(merkleStorageAddress, {
                    identityCommitment: identityCommitmentHex
                })

                merkleProof = deserializeMerkleProof(response.data.merkleProof)
            } else {
                const proofArtifacts = merkleProofArtifacts as MerkleProofArtifacts
                //const leaves = proofArtifacts.leaves.map((leaf) => hexToBigint(leaf))

                merkleProof = generateMerkleProoof(proofArtifacts.depth, identityCommitment);
            }

            const fullProof: RLNFullProof = await rln.genProof(signal, merkleProof, externalNullifier)
            return fullProof
        } catch (e) {
            throw new Error(`Error while generating RLN proof: ${e}`)
        }
    }
}
