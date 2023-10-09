import omit from "lodash/omit";

import { createNewIdentity } from "../..";

describe("identity/factory", () => {
  test("should create new identity properly ", () => {
    const defaultArgs = {
      name: "name",
      account: "account",
      messageSignature: "signature",
      groups: [],
      urlOrigin: "http://localhost:3000",
      isDeterministic: true,
      nonce: 0,
      isImported: false,
    };

    const identity = createNewIdentity(defaultArgs);

    expect(identity.metadata).toStrictEqual(omit(defaultArgs, ["messageSignature"]));
  });

  test("should create imported identity properly ", () => {
    const defaultArgs = {
      account: undefined,
      nonce: undefined,
      name: "name",
      groups: [],
      urlOrigin: "http://localhost:3000",
      nullifier: "12578821460373135693013277026392552769801800051254682675996381598033497431909",
      trapdoor: "8599172605644748803815316525430713607475871751016594621440814664229873275229",
      isDeterministic: false,
      isImported: true,
    };

    const identity = createNewIdentity(defaultArgs);

    expect(identity.metadata).toStrictEqual(omit(defaultArgs, ["trapdoor", "nullifier"]));
  });
});
