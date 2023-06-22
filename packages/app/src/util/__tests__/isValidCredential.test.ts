import { VerifiableCredential } from "@src/types";

import { isValidVerifiableCredential } from "../isValidCredential";

describe("util/isValidCredential", () => {
  test("should return true for a valid verifiable credential", () => {
    const cred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    } as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(true);
  });
});
