import { groth16 } from "snarkjs"
import hash from "./hash"
import { FullProof } from "./types"
import unpackProof from "./unpackProof"
import verificationKeys from "./verificationKeys.json"

/**
 * Verifies a Semaphore proof.
 * @param fullProof The SnarkJS Semaphore proof.
 * @param treeDepth The Merkle tree depth.
 * @returns True if the proof is valid, false otherwise.
 */
export default function verifyProof(
    { merkleTreeRoot, nullifierHash, externalNullifier, signal, proof }: FullProof,
    treeDepth: number
): Promise<boolean> {
    if (treeDepth < 16 || treeDepth > 32) {
        throw new TypeError("The tree depth must be a number between 16 and 32")
    }

    const verificationKey = {
        ...verificationKeys,
        vk_delta_2: verificationKeys.vk_delta_2[treeDepth - 16],
        IC: verificationKeys.IC[treeDepth - 16]
    }

    return groth16.verify(
        verificationKey,
        [merkleTreeRoot, nullifierHash, hash(signal), hash(externalNullifier)],
        unpackProof(proof)
    )
}
