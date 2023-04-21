import { Identity } from "@semaphore-protocol/identity";

import { SerializedIdentity, IdentityMetadata } from "@src/types";

export default class ZkIdentityDecorater {
  zkIdentity: Identity;

  metadata: IdentityMetadata;

  constructor(zkIdentity: Identity, metadata: IdentityMetadata) {
    this.zkIdentity = zkIdentity;
    this.metadata = metadata;
  }

  genIdentityCommitment = (): bigint => this.zkIdentity.getCommitment();

  setIdentityMetadataName = (name: string): IdentityMetadata => {
    this.metadata.name = name;
    return this.metadata;
  };

  serialize = (): string =>
    JSON.stringify({
      secret: this.zkIdentity.toString(),
      metadata: this.metadata,
    });

  static genFromSerialized = (serialized: string): ZkIdentityDecorater => {
    const data = JSON.parse(serialized) as SerializedIdentity;

    if (!data.metadata) {
      throw new Error("Metadata missing");
    }

    if (!data.secret) {
      throw new Error("Secret missing");
    }

    return new ZkIdentityDecorater(new Identity(data.secret), data.metadata);
  };
}
