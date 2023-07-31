import { parseSerializedVerifiableCredential, validateVerifiableCredential } from "../utils";

describe("util/isValidCredential", () => {
  test("should parse a date object correctly inside of a verifiable credential", async () => {
    const date = new Date();
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: date,
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    const cred = await parseSerializedVerifiableCredential(credJson);

    expect(cred).not.toBeNull();
    expect(date.getTime()).toBe(cred.issuanceDate.getTime());
  });

  test("should return true for a valid verifiable credential", async () => {
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
    const cred = await parseSerializedVerifiableCredential(credJson);

    expect(cred).not.toBeNull();
    expect(validateVerifiableCredential(cred)).not.toBeNull();
  });

  test("should return null if the string is not valid JSON", () => {
    const rawCred = "asdf";
    expect(async () => {
      await parseSerializedVerifiableCredential(rawCred);
    }).rejects.toThrow(`Serialized Verifiable Credential is not valid JSON`);
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
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
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
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
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
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
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
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
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
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the issuer property does not exist", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the issuer property is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: 3,
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the issuance date does not exist", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the issuance date is not a date", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: "asd",
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the expiration date is not a date", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      expirationDate: "asd",
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the subject property does not exist", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the subject id is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: 3,
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the claims are not of valid format", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date(),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: {
            value: 3,
          },
        },
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the status id is not a string", () => {
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
      credentialStatus: {
        id: 3,
        type: "some type",
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the status type is not a string", () => {
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
      credentialStatus: {
        id: "asdf",
        type: 3,
      },
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof id is not a string", () => {
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
      proof: [
        {
          id: 3,
          type: "some type",
          proofPurpose: "some proof purpose",
          verificationMethod: "some verification method",
          created: new Date(),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof type is not a string", () => {
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
      proof: [
        {
          id: "some id",
          type: null,
          proofPurpose: "some proof purpose",
          verificationMethod: "some verification method",
          created: new Date(),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof purpose is not a string", () => {
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
      proof: [
        {
          id: "some id",
          type: "some type",
          proofPurpose: false,
          verificationMethod: "some verification method",
          created: new Date(),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof verification method is not a string", () => {
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
      proof: [
        {
          id: "some id",
          type: "some type",
          proofPurpose: "some proof purpose",
          verificationMethod: {},
          created: new Date(),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof created time is not a date", () => {
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
      proof: [
        {
          id: "some id",
          type: "some type",
          proofPurpose: "some proof purpose",
          verificationMethod: "some verification method",
          created: 123,
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof value is not a string", () => {
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
      proof: [
        {
          id: "some id",
          type: "some type",
          proofPurpose: "some proof purpose",
          verificationMethod: "some verification method",
          created: new Date(),
          proofValue: 1234,
        },
      ],
    };
    const credJson = JSON.stringify(rawCred);
    expect(async () => {
      await parseSerializedVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });
});
