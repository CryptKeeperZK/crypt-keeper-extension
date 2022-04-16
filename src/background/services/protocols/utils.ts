import { hexToBigint } from 'bigint-conversion'
import { MerkleProof } from '@zk-kit/protocols'
import * as ciromlibjs from 'circomlibjs'
// eslint-disable-next-line import/prefer-default-export
export function deserializeMerkleProof(merkleProof): MerkleProof {
    const deserialized = {} as MerkleProof
    deserialized.root = hexToBigint(merkleProof.root)
    deserialized.siblings = merkleProof.siblings.map((siblings) =>
        Array.isArray(siblings) ? siblings.map((element) => hexToBigint(element)) : hexToBigint(siblings)
    )
    deserialized.pathIndices = merkleProof.pathIndices
    deserialized.leaf = hexToBigint(merkleProof.leaf)
    return deserialized
}

export const poseidonHash = (data: Array<bigint>): bigint => ciromlibjs.poseidon(data)
