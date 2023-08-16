import { Identity } from "@cryptkeeperzk/semaphore-identity";

import type { SerializedIdentity, IdentityMetadata } from "@cryptkeeperzk/types";

export class ZkIdentitySemaphore {
  zkIdentity: Identity;

  metadata: IdentityMetadata;

  constructor(zkIdentity: Identity, metadata: IdentityMetadata) {
    this.zkIdentity = zkIdentity;
    this.metadata = metadata;
  }

  genIdentityCommitment = (): bigint => this.zkIdentity.getCommitment();

  updateMetadata = (metadata: Partial<IdentityMetadata>): IdentityMetadata => {
    this.metadata = { ...this.metadata, ...metadata };

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
