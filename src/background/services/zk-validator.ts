import { ZkInputs } from '@src/types'

export default class ZkValidator {
    // eslint-disable-next-line class-methods-use-this
    validateZkInputs(payload: Required<ZkInputs>) {
        const { circuitFilePath, zkeyFilePath, merkleProofArtifacts, merkleProof } = payload

        if (!circuitFilePath) throw new Error('circuitFilePath not provided')
        if (!zkeyFilePath) throw new Error('zkeyFilePath not provided')

        if (merkleProof) {
            if (!merkleProof.root) throw new Error('invalid merkleProof.root value')
            if (!merkleProof.siblings.length) throw new Error('invalid merkleProof.siblings value')
            if (!merkleProof.pathIndices.length) throw new Error('invalid merkleProof.pathIndices value')
            if (!merkleProof.leaf) throw new Error('invalid merkleProof.leaf value')
        } else if (merkleProofArtifacts) {
            if (!merkleProofArtifacts.leaves.length || merkleProofArtifacts.leaves.length === 0)
                throw new Error('invalid merkleProofArtifacts.leaves value')
            if (!merkleProofArtifacts.depth) throw new Error('invalid merkleProofArtifacts.depth value')
            if (!merkleProofArtifacts.leavesPerNode) throw new Error('invalid merkleProofArtifacts.leavesPerNode value')
        }

        return payload
    }
}
