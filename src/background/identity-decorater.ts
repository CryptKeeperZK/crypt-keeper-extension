import { ZkIdentity } from '@zk-kit/identity'
import { SerializedIdentity, IdentityMetadata } from '@src/types'

export default class ZkIdentityDecorater {
    public zkIdentity: ZkIdentity

    public metadata: IdentityMetadata

    constructor(zkIdentity: ZkIdentity, metadata: IdentityMetadata) {
        this.zkIdentity = zkIdentity
        this.metadata = metadata
    }

    genIdentityCommitment = (): bigint => {
        const idCommitment = this.zkIdentity.genIdentityCommitment()
        return idCommitment
    }

    serialize = (): string => {
        const serialized = {
            secret: this.zkIdentity.serializeIdentity(),
            metadata: this.metadata
        }

        return JSON.stringify(serialized)
    }

    static genFromSerialized = (serialized: string): ZkIdentityDecorater => {
        const data: SerializedIdentity = JSON.parse(serialized)
        if (!data.metadata) throw new Error('Metadata missing')
        if (!data.secret) throw new Error('Secret missing')

        // TODO overload zkIdentity function to work both with array and string
        const zkIdentity = new ZkIdentity(2, data.secret)
        return new ZkIdentityDecorater(zkIdentity, data.metadata)
    }
}
