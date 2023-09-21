import omit from "lodash/omit";

import { createNewIdentity } from "../..";

describe("identity/factory", () => {
  test("should create new identity properly ", () => {
    const defaultArgs = {
      name: "name",
      account: "account",
      messageSignature: "signature",
      groups: [],
      host: "http://localhost:3000",
      isDeterministic: true,
    };

    const identity = createNewIdentity(defaultArgs);

    expect(identity.metadata).toStrictEqual(omit(defaultArgs, ["messageSignature"]));
  });
});
