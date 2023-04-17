import { identityFactory, IdentityDecoraterService } from "@src/background/services/identity";
import { ZERO_ADDRESS } from "@src/config/const";

describe("background/identityFactory", () => {
  test("should create a random identity", () => {
    const identity1 = identityFactory("random", {
      name: "name",
      account: ZERO_ADDRESS,
      identityStrategy: "random",
    });
    const identity2 = IdentityDecoraterService.genFromSerialized(identity1.serialize());

    expect(identity1.zkIdentity.getTrapdoor()).toEqual(identity2.zkIdentity.getTrapdoor());
    expect(identity1.zkIdentity.getNullifier()).toEqual(identity2.zkIdentity.getNullifier());
  });

  test("should create a twitter identity", () => {
    const identity1 = identityFactory("interrep", {
      name: "name",
      account: ZERO_ADDRESS,
      identityStrategy: "interrep",
      web2Provider: "twitter",
      messageSignature: "signature",
    });
    const identity2 = IdentityDecoraterService.genFromSerialized(identity1.serialize());

    expect(identity1.zkIdentity.getTrapdoor()).toEqual(identity2.zkIdentity.getTrapdoor());
    expect(identity1.zkIdentity.getNullifier()).toEqual(identity2.zkIdentity.getNullifier());
  });

  test("should not create an interrep identity without the required parameters", () => {
    const fun = () =>
      identityFactory("interrep", {
        name: "name",
        account: ZERO_ADDRESS,
        identityStrategy: "interrep",
      });

    expect(fun).toThrow();
  });
});
