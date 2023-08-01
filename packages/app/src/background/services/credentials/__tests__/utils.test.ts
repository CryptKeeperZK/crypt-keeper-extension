import stringify from "json-stable-stringify";

import {
  serializeCryptkeeperVerifiableCredential,
  deserializeCryptkeeperVerifiableCredential,
  serializeVerifiableCredential,
  deserializeVerifiableCredential,
  validateVerifiableCredential,
  generateInitialMetadataForVerifiableCredential,
  hashVerifiableCredential,
} from "../utils";

describe("util/serializeCryptkeeperVerifiableCredential", () => {
  test("should serialize and deserialize CryptkeeperVerifiableCredential object correctly", async () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const metadata = generateInitialMetadataForVerifiableCredential(rawCred);
    const cryptkeeperCred = {
      verifiableCredential: rawCred,
      metadata,
    };
    const serializedCred = serializeCryptkeeperVerifiableCredential(cryptkeeperCred);
    const deserializedCred = await deserializeCryptkeeperVerifiableCredential(serializedCred);

    expect(deserializedCred.verifiableCredential).toStrictEqual(rawCred);
    expect(deserializedCred.metadata).toStrictEqual(metadata);
    expect(serializeCryptkeeperVerifiableCredential(deserializedCred)).toBe(
      serializeCryptkeeperVerifiableCredential(cryptkeeperCred),
    );
  });
});

describe("util/deserializeVerifiableCredential", () => {
  test("should deserialize a verifiable credential correctly", async () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = serializeVerifiableCredential(rawCred);
    const deserializedCred = await deserializeVerifiableCredential(credJson);

    expect(deserializedCred).toStrictEqual(rawCred);
    expect(serializeVerifiableCredential(deserializedCred)).toBe(credJson);
  });
});

describe("util/validateVerifiableCredential", () => {
  test("should correctly validiate a valid verifiable credential", async () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = serializeVerifiableCredential(rawCred);
    const cred = await deserializeVerifiableCredential(credJson);

    expect(cred).not.toBeNull();
    expect(validateVerifiableCredential(cred)).not.toBeNull();
  });

  test("should return null if the string is not valid JSON", () => {
    const rawCred = "asdf";
    expect(async () => {
      await deserializeVerifiableCredential(rawCred);
    }).rejects.toThrow(`Serialized Verifiable Credential is not valid JSON`);
  });

  test("should return false if the context property is not an array", () => {
    const rawCred = {
      context: "https://www.w3.org/2018/credentials/v1",
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if context entries are not strings", () => {
    const rawCred = {
      context: [3],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the id property is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: 3,
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the type property is not an array", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: "VerifiableCredential",
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the type array entries are not strings", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: [3],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the issuer property does not exist", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the issuer property is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: 3,
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
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
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
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
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the expiration date is not a date", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      expirationDate: "asd",
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the subject property does not exist", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the subject id is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: 3,
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the claims are not of valid format", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: {
            value: 3,
          },
        },
      },
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the status id is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the status type is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof id is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
          created: new Date("2010-01-01T19:23:24Z"),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof type is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
          created: new Date("2010-01-01T19:23:24Z"),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof purpose is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
          created: new Date("2010-01-01T19:23:24Z"),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof verification method is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
          created: new Date("2010-01-01T19:23:24Z"),
          proofValue: "some proof value",
        },
      ],
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof created time is not a date", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });

  test("should return false if the proof value is not a string", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
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
          created: new Date("2010-01-01T19:23:24Z"),
          proofValue: 1234,
        },
      ],
    };
    const credJson = stringify(rawCred);
    expect(async () => {
      await deserializeVerifiableCredential(credJson);
    }).rejects.toThrow(`Invalid Verifiable Credential`);
  });
});

describe("util/hashVerifiableCredential", () => {
  it("should produce deterministic hashes", () => {
    const credOne = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credTwo = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };

    expect(hashVerifiableCredential(credOne)).toBe(hashVerifiableCredential(credTwo));
  });

  it("should produce the same hash after serialization/deserialization", async () => {
    const cred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = serializeVerifiableCredential(cred);
    const deserializedCred = await deserializeVerifiableCredential(credJson);

    expect(hashVerifiableCredential(cred)).toBe(hashVerifiableCredential(deserializedCred));
  });
});

describe("util/generateInitialMetadataForVerifiableCredential", () => {
  it("should generate the correct metadata for a verifiable credential", () => {
    const rawCred = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const metadata = generateInitialMetadataForVerifiableCredential(rawCred);
    const expectedMetadata = {
      name: "Verifiable Credential",
      hash: hashVerifiableCredential(rawCred),
    };

    expect(metadata).toStrictEqual(expectedMetadata);
  });
});
