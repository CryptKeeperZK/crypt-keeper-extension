// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express')
const { generateMerkleProof } = require('@zk-kit/protocols')
const { ZkIdentity } = require('@zk-kit/identity')
const { bigintToHex, hexToBigint } = require('bigint-conversion')

const DEPTH_RLN = 15
const NUMBER_OF_LEAVES_RLN = 2
const DEPTH_SEMAPHORE = 20
const NUMBER_OF_LEAVES_SEMAPHORE = 2
const ZERO_VALUE = BigInt(0)

const serializeMerkleProof = (merkleProof) => {
    const serialized = {}
    serialized.root = bigintToHex(merkleProof.root)
    serialized.siblings = merkleProof.siblings.map((siblings) =>
        Array.isArray(siblings) ? siblings.map((element) => bigintToHex(element)) : bigintToHex(siblings)
    )
    serialized.pathIndices = merkleProof.pathIndices
    serialized.leaf = bigintToHex(merkleProof.leaf)
    return serialized
}

const generateMerkleProofRLN = (identityCommitments, identityCommitment) => {
    return generateMerkleProof(DEPTH_RLN, ZERO_VALUE, NUMBER_OF_LEAVES_RLN, identityCommitments, identityCommitment)
}

const generateMerkleProofSemaphore = (identityCommitments, identityCommitment) => {
    return generateMerkleProof(
        DEPTH_SEMAPHORE,
        ZERO_VALUE,
        NUMBER_OF_LEAVES_SEMAPHORE,
        identityCommitments,
        identityCommitment
    )
}

const identityCommitments = []

// eslint-disable-next-line no-plusplus
for (let i = 0; i < 2; i++) {
    const mockIdentity = new ZkIdentity()
    identityCommitments.push(mockIdentity.genIdentityCommitment())
}

const app = express()
app.use(express.json())

app.post('/merkleProof/:type', (req, res) => {
    let type = req.params.type
    let { identityCommitment } = req.body
    identityCommitment = hexToBigint(identityCommitment)

    if (!identityCommitments.includes(identityCommitment)) {
        identityCommitments.push(identityCommitment)
    }
    const merkleProof =
        type === 'RLN'
            ? generateMerkleProofRLN(identityCommitments, identityCommitment)
            : generateMerkleProofSemaphore(identityCommitments, identityCommitment)

    const serializedMerkleProof = serializeMerkleProof(merkleProof)
    console.log('Sending proof with root: ', serializedMerkleProof.root)
    res.send({ merkleProof: serializedMerkleProof })
})

app.listen(8090, () => {
    console.log('Merkle service is listening')
})
