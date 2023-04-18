import { Identity } from "@semaphore-protocol/identity";

import { SerializedIdentity, IdentityMetadata } from "@src/types";

export class IdentityDecoraterService {
  public zkIdentity: Identity;

  public metadata: IdentityMetadata;

  public constructor(zkIdentity: Identity, metadata: IdentityMetadata) {
    this.zkIdentity = zkIdentity;
    this.metadata = metadata;
  }

  public genIdentityCommitment = (): bigint => this.zkIdentity.getCommitment();

  public setIdentityMetadataName = (name: string): IdentityMetadata => {
    this.metadata.name = name;
    return this.metadata;
  };

  public serialize = (): string =>
    JSON.stringify({
      secret: this.zkIdentity.toString(),
      metadata: this.metadata,
    });

  public static genFromSerialized = (serialized: string): IdentityDecoraterService => {
    const data = JSON.parse(serialized) as SerializedIdentity;

    if (!data.metadata) {
      throw new Error("Metadata missing");
    }

    if (!data.secret) {
      throw new Error("Secret missing");
    }

    return new IdentityDecoraterService(new Identity(data.secret), data.metadata);
  };
}
