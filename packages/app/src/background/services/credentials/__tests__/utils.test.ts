import stringify from "json-stable-stringify";
import * as yup from "yup";

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
    const rawCredential = {
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
    const metadata = generateInitialMetadataForVerifiableCredential(rawCredential);
    const cryptkeeperCred = {
      verifiableCredential: rawCredential,
      metadata,
    };
    const serializedCred = serializeCryptkeeperVerifiableCredential(cryptkeeperCred);
    const deserializedCred = await deserializeCryptkeeperVerifiableCredential(serializedCred);

    expect(deserializedCred.verifiableCredential).toStrictEqual(rawCredential);
    expect(deserializedCred.metadata).toStrictEqual(metadata);
    expect(serializeCryptkeeperVerifiableCredential(deserializedCred)).toBe(
      serializeCryptkeeperVerifiableCredential(cryptkeeperCred),
    );
  });
});

describe("util/deserializeVerifiableCredential", () => {
  test("should deserialize a verifiable credential correctly", async () => {
    const rawCredential = {
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
    const credentialJson = serializeVerifiableCredential(rawCredential);
    const deserializedCred = await deserializeVerifiableCredential(credentialJson);

    expect(deserializedCred).toStrictEqual(rawCredential);
    expect(serializeVerifiableCredential(deserializedCred)).toBe(credentialJson);
  });

  test("should throw an error if verifiable credential is not provider", async () => {
    await expect(deserializeVerifiableCredential("")).rejects.toThrow(
      "Serialized Verifiable Credential is not provided",
    );

    await expect(deserializeCryptkeeperVerifiableCredential("")).rejects.toThrow(
      "Serialized Cryptkeeper Verifiable Credential is not provided",
    );
  });
});

describe("util/validateVerifiableCredential", () => {
  test("should correctly validate a valid verifiable credential", async () => {
    const rawCredential = {
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
    const credentialJson = serializeVerifiableCredential(rawCredential);
    const credential = await deserializeVerifiableCredential(credentialJson);

    expect(credential).not.toBeNull();
    await expect(validateVerifiableCredential(credential)).resolves.not.toBeNull();
  });

  test("should correctly validate a valid verifiable credential with array", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          names: ["John Doe", "Mary Jane"],
        },
      },
    };
    const credentialJson = serializeVerifiableCredential(rawCredential);
    const credential = await deserializeVerifiableCredential(credentialJson);

    expect(credential).not.toBeNull();
    await expect(validateVerifiableCredential(credential)).resolves.not.toBeNull();
  });

  test("should throw an error is there are validation errors", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          names: [null] as unknown as string[],
          name: undefined as unknown as string,
        },
      },
    };
    const credentialJson = serializeVerifiableCredential(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(
      "claim value must be a string, array, or object",
    );
  });

  test("should return null if the string is not valid JSON", async () => {
    const rawCredential = "asdf";

    await expect(deserializeVerifiableCredential(rawCredential)).rejects.toThrow(SyntaxError);
  });

  test("should return verifiable credention if validation is passed successfully", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "3",
      type: ["VerifiableCredential"],
      issuer: { id: "did:ethr:0x123" },
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: {
            firstName: "John",
            lastName: "Doe",
          },
        },
      },
    };
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).resolves.not.toBeNull();
  });

  test("should return false if the context property is not an array", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if context entries are not strings", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the id property is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the type property is not an array", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the type array entries are not strings", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the issuer property does not exist", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the issuer property is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the issuance date does not exist", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the issuance date is not a date", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the expiration date is not a date", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the subject property does not exist", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
    };
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the subject id is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the claims are not of valid format", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the status id is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the status type is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the proof id is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the proof type is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the proof purpose is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the proof verification method is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the proof created time is not a date", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the proof value is not a string", async () => {
    const rawCredential = {
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
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(yup.ValidationError);
  });
});

describe("util/hashVerifiableCredential", () => {
  test("should produce deterministic hashes", () => {
    const credentialOne = {
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

    const credentialTwo = {
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

    expect(hashVerifiableCredential(credentialOne)).toBe(hashVerifiableCredential(credentialTwo));
  });

  test("should produce the same hash after serialization/deserialization", async () => {
    const credential = {
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
    const credentialJson = serializeVerifiableCredential(credential);
    const deserializedCred = await deserializeVerifiableCredential(credentialJson);

    expect(hashVerifiableCredential(credential)).toBe(hashVerifiableCredential(deserializedCred));
  });
});

describe("util/generateInitialMetadataForVerifiableCredential", () => {
  test("should generate the correct metadata for a verifiable credential", () => {
    const rawCredential = {
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
    const metadata = generateInitialMetadataForVerifiableCredential(rawCredential);
    const expectedMetadata = {
      name: "Verifiable Credential",
      hash: hashVerifiableCredential(rawCredential),
    };

    expect(metadata).toStrictEqual(expectedMetadata);
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
