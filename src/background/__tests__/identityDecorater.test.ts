import { Identity } from "@semaphore-protocol/identity";
import { ZERO_ADDRESS } from "@src/config/const";
import { IdentityMetadata } from "@src/types";
import ZkIdentityDecorater from "../identityDecorater";

describe("background/identityDecorater", () => {
  const defaultIdentity = new Identity("1234");

  const defaultCommitment = 3291524420495860417784419114907647375829073240404299572994630330423309281511n;

  const defaultIdentityMetadata: IdentityMetadata = {
    account: ZERO_ADDRESS,
    name: "Identity #1",
    identityStrategy: "interrep",
    web2Provider: "twitter",
  };

  test("should decorate identity properly", () => {
    const zkIdentityDecorater = new ZkIdentityDecorater(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.zkIdentity).toStrictEqual(defaultIdentity);
    expect(zkIdentityDecorater.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should return identity commitment properly", () => {
    const zkIdentityDecorater = new ZkIdentityDecorater(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.genIdentityCommitment()).toBe(defaultCommitment);
  });

  test("should set metadata name properly", () => {
    const zkIdentityDecorater = new ZkIdentityDecorater(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.setIdentityMetadataName("new name")).toStrictEqual({
      ...defaultIdentityMetadata,
      name: "new name",
    });
  });

  test("should serialize and deserialize properly", () => {
    const zkIdentityDecorater = new ZkIdentityDecorater(defaultIdentity, defaultIdentityMetadata);
    const serialized = zkIdentityDecorater.serialize();
    const deserialized = ZkIdentityDecorater.genFromSerialized(serialized);

    expect(deserialized.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should check metadata and secret data when deserializing", () => {
    expect(() => ZkIdentityDecorater.genFromSerialized("{}")).toThrowError("Metadata missing");
    expect(() => ZkIdentityDecorater.genFromSerialized(JSON.stringify({ metadata: {} }))).toThrowError(
      "Secret missing",
    );
  });
});
