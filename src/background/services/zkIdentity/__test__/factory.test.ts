import { ZERO_ADDRESS } from "@src/config/const";

import { createNewIdentity } from "../factory";

describe("background/services/zkIdentity/factory", () => {
  test("should return new interrep identity ", () => {
    const identity = createNewIdentity("interrep", {
      identityStrategy: "interrep",
      name: "name",
      account: ZERO_ADDRESS,
      messageSignature: "signature",
      web2Provider: "github",
    });

    expect(identity.metadata).toStrictEqual({
      account: ZERO_ADDRESS,
      identityStrategy: "interrep",
      name: "name",
      web2Provider: "github",
    });
  });

  test("should return new random identity ", () => {
    const identity = createNewIdentity("random", {
      identityStrategy: "random",
      name: "name",
      account: ZERO_ADDRESS,
      messageSignature: "signature",
    });

    expect(identity.metadata).toStrictEqual({
      account: "",
      identityStrategy: "random",
      name: "name",
    });
  });
});
