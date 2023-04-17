import { Identity } from "@semaphore-protocol/identity";

import { ZERO_ADDRESS } from "@src/config/const";
import { IdentityMetadata } from "@src/types";

import { IdentityDecoraterService } from "../IdentityDecorater";

describe("background/identityDecorater", () => {
  const defaultIdentity = new Identity("1234");

  const defaultIdentityMetadata: IdentityMetadata = {
    account: ZERO_ADDRESS,
    name: "Identity #1",
    identityStrategy: "interrep",
    web2Provider: "twitter",
  };

  test("should decorate identity properly", () => {
    const zkIdentityDecorater = new IdentityDecoraterService(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.zkIdentity).toStrictEqual(defaultIdentity);
    expect(zkIdentityDecorater.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should return identity commitment properly", () => {
    const zkIdentityDecorater = new IdentityDecoraterService(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.genIdentityCommitment()).toBeDefined();
  });

  test("should set metadata name properly", () => {
    const zkIdentityDecorater = new IdentityDecoraterService(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorater.setIdentityMetadataName("new name")).toStrictEqual({
      ...defaultIdentityMetadata,
      name: "new name",
    });
  });

  test("should serialize and deserialize properly", () => {
    const zkIdentityDecorater = new IdentityDecoraterService(defaultIdentity, defaultIdentityMetadata);
    const serialized = zkIdentityDecorater.serialize();
    const deserialized = IdentityDecoraterService.genFromSerialized(serialized);

    expect(deserialized.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should check metadata and secret data when deserializing", () => {
    expect(() => IdentityDecoraterService.genFromSerialized("{}")).toThrowError("Metadata missing");
    expect(() => IdentityDecoraterService.genFromSerialized(JSON.stringify({ metadata: {} }))).toThrowError(
      "Secret missing",
    );
  });
});
