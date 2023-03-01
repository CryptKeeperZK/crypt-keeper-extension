import { ZERO_ADDRESS } from "@src/config/const";

import ZkIdentityDecorater from "../identityDecorater";
import identityFactory from "../identityFactory";

describe("background/identityFactory", () => {
  test("should create a random identity", async () => {
    const identity1 = await identityFactory("random", {
      name: "name",
      account: ZERO_ADDRESS,
      identityStrategy: "random",
    });
    const identity2 = ZkIdentityDecorater.genFromSerialized(identity1.serialize());

    expect(identity1.zkIdentity.getTrapdoor()).toEqual(identity2.zkIdentity.getTrapdoor());
    expect(identity1.zkIdentity.getNullifier()).toEqual(identity2.zkIdentity.getNullifier());
  });

  test("should create a twitter identity", async () => {
    const identity1 = await identityFactory("interrep", {
      name: "name",
      account: ZERO_ADDRESS,
      identityStrategy: "interrep",
      web2Provider: "twitter",
      messageSignature: "signature",
    });
    const identity2 = ZkIdentityDecorater.genFromSerialized(identity1.serialize());

    expect(identity1.zkIdentity.getTrapdoor()).toEqual(identity2.zkIdentity.getTrapdoor());
    expect(identity1.zkIdentity.getNullifier()).toEqual(identity2.zkIdentity.getNullifier());
  });

  test("should not create an interrep identity without the required parameters", async () => {
    const fun = () =>
      identityFactory("interrep", {
        name: "name",
        account: ZERO_ADDRESS,
        identityStrategy: "interrep",
      });

    await expect(fun).rejects.toThrow();
  });
});
