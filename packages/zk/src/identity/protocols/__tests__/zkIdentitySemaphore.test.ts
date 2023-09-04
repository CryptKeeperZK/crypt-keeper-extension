import { Identity } from "@cryptkeeperzk/semaphore-identity";

import type { IIdentityMetadata } from "@cryptkeeperzk/types";

import { ZkIdentitySemaphore } from "..";

describe("protocols/ZkIdentitySemaphore", () => {
  const defaultIdentity = new Identity("1234");

  const defaultIdentityMetadata: IIdentityMetadata = {
    account: "account",
    name: "Identity #1",
    identityStrategy: "interep",
    web2Provider: "twitter",
    groups: [],
    host: "http://localhost:3000",
  };

  test("should decorate identity properly", () => {
    const zkIdentityDecorator = new ZkIdentitySemaphore(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorator.zkIdentity).toStrictEqual(defaultIdentity);
    expect(zkIdentityDecorator.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should return identity commitment properly", () => {
    const zkIdentityDecorator = new ZkIdentitySemaphore(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorator.genIdentityCommitment()).toBeDefined();
  });

  test("should set metadata name properly", () => {
    const zkIdentityDecorator = new ZkIdentitySemaphore(defaultIdentity, defaultIdentityMetadata);

    expect(zkIdentityDecorator.updateMetadata({ name: "new name" })).toStrictEqual({
      ...defaultIdentityMetadata,
      name: "new name",
    });
  });

  test("should serialize and deserialize properly", () => {
    const zkIdentityDecorator = new ZkIdentitySemaphore(defaultIdentity, defaultIdentityMetadata);
    const serialized = zkIdentityDecorator.serialize();
    const deserialized = ZkIdentitySemaphore.genFromSerialized(serialized);

    expect(deserialized.metadata).toStrictEqual(defaultIdentityMetadata);
  });

  test("should check metadata and secret data when deserializing", () => {
    expect(() => ZkIdentitySemaphore.genFromSerialized("{}")).toThrowError("Metadata missing");
    expect(() => ZkIdentitySemaphore.genFromSerialized(JSON.stringify({ metadata: {} }))).toThrowError(
      "Secret missing",
    );
  });
});
