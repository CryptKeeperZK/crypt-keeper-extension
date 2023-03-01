import { Identity } from "@semaphore-protocol/identity";
import { SerializedIdentity, IdentityMetadata } from "@src/types";

export default class ZkIdentityDecorater {
  public zkIdentity: Identity;
  public metadata: IdentityMetadata;

  constructor(zkIdentity: Identity, metadata: IdentityMetadata) {
    this.zkIdentity = zkIdentity;
    this.metadata = metadata;
  }

  genIdentityCommitment = (): bigint => {
    return this.zkIdentity.getCommitment();
  };

  setIdentityMetadataName = (name: string): IdentityMetadata => {
    this.metadata.name = name;
    return this.metadata;
  };

  serialize = (): string => {
    return JSON.stringify({
      secret: this.zkIdentity.toString(),
      metadata: this.metadata,
    });
  };

  static genFromSerialized = (serialized: string): ZkIdentityDecorater => {
    const data: SerializedIdentity = JSON.parse(serialized);

    if (!data.metadata) {
      throw new Error("Metadata missing");
    }

    if (!data.secret) {
      throw new Error("Secret missing");
    }

    return new ZkIdentityDecorater(new Identity(data.secret), data.metadata);
  };
}
