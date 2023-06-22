import { VerifiableCredential } from "@src/types";

import { isValidVerifiableCredential } from "../isValidCredential";

describe("util/isValidCredential", () => {
  test("should return true for a valid verifiable credential", () => {
    const rawCred = {
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
    };
    const credJson = JSON.stringify(rawCred);
    const cred = JSON.parse(credJson) as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(true);
  });

  test("should return false if the context property is not an array", () => {
    const rawCred = {
      context: "https://www.w3.org/2018/credentials/v1",
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    const cred = JSON.parse(credJson) as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(false);
  });

  test("should return false if context entries are not strings", () => {
    const rawCred = {
      context: [3],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    const cred = JSON.parse(credJson) as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(false);
  });

  test("should return false if the id property is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: 3,
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    const cred = JSON.parse(credJson) as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(false);
  });

  test("should return false if the type property is not an array", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: "VerifiableCredential",
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    const cred = JSON.parse(credJson) as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(false);
  });

  test("should return false if the type array entries are not strings", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: [3],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    const cred = JSON.parse(credJson) as VerifiableCredential;

    expect(isValidVerifiableCredential(cred)).toBe(false);
  });
});
