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
    };

    const identity = createNewIdentity(defaultArgs);

    expect(identity.metadata).toStrictEqual(omit(defaultArgs, ["messageSignature"]));
  });
});
