import { Identity } from "@semaphore-protocol/identity";

import { SerializedIdentity, IdentityMetadata } from "@src/types";

export class ZkIdentitySemaphore {
  zkIdentity: Identity;

  metadata: IdentityMetadata;

  constructor(zkIdentity: Identity, metadata: IdentityMetadata) {
    this.zkIdentity = zkIdentity;
    this.metadata = metadata;
  }

  genIdentityCommitment = (): bigint => this.zkIdentity.getCommitment();

  // TODO: this should be more genraric to `updateIdentityMetadata()`
  setIdentityMetadataName = (name: string): IdentityMetadata => {
    this.metadata.name = name;
    return this.metadata;
  };

  setIdentityMetadataHost = (host: string): IdentityMetadata => {
    this.metadata.host = host;
    return this.metadata;
  };

  serialize = (): string =>
    JSON.stringify({
      secret: this.zkIdentity.toString(),
      metadata: this.metadata,
    });

  static genFromSerialized = (serialized: string): ZkIdentitySemaphore => {
    const data = JSON.parse(serialized) as SerializedIdentity;

    if (!data.metadata) {
      throw new Error("Metadata missing");
    }

    if (!data.secret) {
      throw new Error("Secret missing");
    }

    return new ZkIdentitySemaphore(new Identity(data.secret), data.metadata);
  };
}
