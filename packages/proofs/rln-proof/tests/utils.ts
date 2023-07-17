import { IncrementalMerkleTree, MerkleProof } from "@zk-kit/incremental-merkle-tree"
import poseidon from "poseidon-lite";
import { zeroPad } from '@ethersproject/bytes'
import { BigNumber } from '@ethersproject/bignumber'
import { keccak256 } from '@ethersproject/keccak256'

import { Fq } from "../src/common"
import { MemoryMessageIDCounter } from "../src/message-id-counter";

export function fieldFactory(excludes?: bigint[], trials: number = 100): bigint {
    if (excludes) {
        for (let i = 0; i < trials; i++) {
            const epoch = Fq.random()
            if (!excludes.includes(epoch)) {
                return epoch
            }
        }
        throw new Error("Failed to generate a random epoch")
    } else {
        return Fq.random()
    }
}

export class FakeMessageIDCounter extends MemoryMessageIDCounter {
    async peekNextMessageID(epoch: bigint): Promise<bigint> {
        const epochStr = epoch.toString()
        if (this.epochToMessageID[epochStr] === undefined) {
          return BigInt(0)
        }
        return this.epochToMessageID[epochStr]
    }
}


function calculateZeroValue(id: bigint): bigint {
    const hexStr = BigNumber.from(id).toTwos(256).toHexString()
    const zeroPadded = zeroPad(hexStr, 32)
    return BigInt(keccak256(zeroPadded)) >> BigInt(8)
}

export function verifyMerkleProof(rlnIdentifier: bigint, proof: MerkleProof, treeDepth: number) {
    const zeroValue = calculateZeroValue(rlnIdentifier)
    const tree = new IncrementalMerkleTree(poseidon, treeDepth, zeroValue, 2)
    proof.siblings = proof.siblings.map((s) => [s])
    return tree.verifyProof(proof)
}

export function generateMerkleProof(rlnIdentifier: bigint, leaves: bigint[], treeDepth: number, index: number) {
    const zeroValue = calculateZeroValue(rlnIdentifier)
    const tree = new IncrementalMerkleTree(poseidon, treeDepth, zeroValue, 2)
    for (const leaf of leaves) {
        tree.insert(leaf)
    }
    return tree.createProof(index)
}
