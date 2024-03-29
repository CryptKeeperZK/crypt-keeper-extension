import stringify from "json-stable-stringify";
import { ValidationError } from "yup";

import {
  serializeCryptkeeperVerifiableCredential,
  deserializeCryptkeeperVerifiableCredential,
  serializeVerifiableCredential,
  deserializeVerifiableCredential,
  validateSerializedVerifiableCredential,
  generateInitialMetadataForVerifiableCredential,
  hashVerifiableCredential,
  serializeVerifiablePresentation,
} from "../credentials";

describe("util/cryptkeeperVerifiableCredential", () => {
  test("should serialize and deserialize CryptkeeperVerifiableCredential object correctly", async () => {
    const defaultCredentialName = "Verifiable Credential";
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
    const metadata = generateInitialMetadataForVerifiableCredential(rawCredential, defaultCredentialName);
    const cryptkeeperCred = {
      verifiableCredential: rawCredential,
      metadata,
    };
    const serializedCredential = serializeCryptkeeperVerifiableCredential(cryptkeeperCred);
    const deserializedCredential = await deserializeCryptkeeperVerifiableCredential(serializedCredential);

    expect(deserializedCredential.verifiableCredential).toStrictEqual(rawCredential);
    expect(deserializedCredential.metadata).toStrictEqual(metadata);
    expect(serializeCryptkeeperVerifiableCredential(deserializedCredential)).toBe(
      serializeCryptkeeperVerifiableCredential(cryptkeeperCred),
    );
  });

  test("should throw error if cryptkeeper credential is an empty string", async () => {
    await expect(deserializeCryptkeeperVerifiableCredential("")).rejects.toThrowError(
      "Serialized CryptKeeper Verifiable Credential is not provided",
    );
  });
});

describe("util/serializeVerifiablePresentation", () => {
  test("should serialize a verifiable presentation correctly", () => {
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
    const verifiablePresentation = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
      verifiableCredential: [rawCredential],
    };

    expect(serializeVerifiablePresentation(verifiablePresentation)).toStrictEqual(
      stringify({ ...verifiablePresentation, verifiableCredential: [serializeVerifiableCredential(rawCredential)] }),
    );
  });

  test("should serialize a verifiable presentation with no credentials correctly", () => {
    const verifiablePresentation = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
    };

    expect(serializeVerifiablePresentation(verifiablePresentation)).toStrictEqual(stringify(verifiablePresentation));
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
    const deserializedCredential = await deserializeVerifiableCredential(credentialJson);

    expect(deserializedCredential).toStrictEqual(rawCredential);
    expect(serializeVerifiableCredential(deserializedCredential)).toBe(credentialJson);
  });

  test("should throw error if there is no serialized credential", async () => {
    await expect(deserializeVerifiableCredential("")).rejects.toThrowError(
      "Serialized Verifiable Credential is not provided",
    );
  });
});

describe("util/validateSerializedVerifiableCredential", () => {
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
    expect(validateSerializedVerifiableCredential(credentialJson)).not.toBeNull();
  });

  test("should validate map claim value properly", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: { name: { firstName: "John", lastName: "Doe" } },
      },
    };
    const credentialJson = serializeVerifiableCredential(rawCredential);
    const credential = await deserializeVerifiableCredential(credentialJson);

    expect(credential).not.toBeNull();
    expect(validateSerializedVerifiableCredential(credentialJson)).not.toBeNull();
  });

  test("should validate array claim value properly", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: { id: "did:ethr:0x123" },
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: { name: [{ firstName: "John", lastName: "Doe" }] },
      },
    };
    const credentialJson = serializeVerifiableCredential(rawCredential);
    const credential = await deserializeVerifiableCredential(credentialJson);

    expect(credential).not.toBeNull();
    expect(validateSerializedVerifiableCredential(credentialJson)).not.toBeNull();
  });

  test("should throw error is array element is not valid", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: { name: [undefined as unknown as string] },
      },
    };
    const credentialJson = serializeVerifiableCredential(rawCredential);

    await expect(validateSerializedVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
  });

  test("should return null if the string is not valid JSON", async () => {
    const rawCredential = "asdf";
    await expect(deserializeVerifiableCredential(rawCredential)).rejects.toThrow(SyntaxError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
  });

  test("should return false if the subject property does not exist", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
    };
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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

    await expect(deserializeVerifiableCredential(credentialJson)).rejects.toThrow(ValidationError);
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
    const deserializedCredential = await deserializeVerifiableCredential(credentialJson);

    expect(hashVerifiableCredential(credential)).toBe(hashVerifiableCredential(deserializedCredential));
  });
});

describe("util/generateInitialMetadataForVerifiableCredential", () => {
  const defaultCredentialName = "Verifiable Credential";

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
    const metadata = generateInitialMetadataForVerifiableCredential(rawCredential, defaultCredentialName);
    const expectedMetadata = {
      name: "Verifiable Credential",
      hash: hashVerifiableCredential(rawCredential),
    };

    expect(metadata).toStrictEqual(expectedMetadata);
  });
});
