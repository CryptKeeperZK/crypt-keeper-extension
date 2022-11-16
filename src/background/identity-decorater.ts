import { Identity } from "@semaphore-protocol/identity";
import { SerializedIdentity, IdentityMetadata } from '@src/types'

export default class ZkIdentityDecorater {
    public zkIdentity: Identity

    public metadata: IdentityMetadata

    constructor(zkIdentity: Identity, metadata: IdentityMetadata) {
        this.zkIdentity = zkIdentity
        this.metadata = metadata
    }

    genIdentityCommitment = (): bigint => {
        const idCommitment = this.zkIdentity.generateCommitment()
        return idCommitment
    }

    setIdentityMetadataName = (name: string): IdentityMetadata => {
        this.metadata.name = name;
        return this.metadata;
    }

    serialize = (): string => {
        const serialized = {
            secret: this.zkIdentity.toString(),
            metadata: this.metadata
        }

        return JSON.stringify(serialized)
    }

    static genFromSerialized = (serialized: string): ZkIdentityDecorater => {
        const data: SerializedIdentity = JSON.parse(serialized)
        if (!data.metadata) throw new Error('Metadata missing')
        if (!data.secret) throw new Error('Secret missing')

        // TODO overload zkIdentity function to work both with array and string
        const zkIdentity = new Identity(data.secret)
        return new ZkIdentityDecorater(zkIdentity, data.metadata)
    }
}
