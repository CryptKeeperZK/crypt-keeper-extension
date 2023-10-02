import stringify from "json-stable-stringify";
import * as yup from "yup";

import {
  serializeCryptkeeperVC,
  deserializeCryptkeeperVC,
  serializeVC,
  deserializeVC,
  validateSerializedVC,
  generateInitialMetadataForVC,
  hashVC,
  serializeVP,
} from "../utils";

describe("util/serializeCryptkeeperVC", () => {
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
    const metadata = generateInitialMetadataForVC(rawCredential, defaultCredentialName);
    const cryptkeeperCred = {
      vc: rawCredential,
      metadata,
    };
    const serializedCred = serializeCryptkeeperVC(cryptkeeperCred);
    const deserializedCred = await deserializeCryptkeeperVC(serializedCred);

    expect(deserializedCred.vc).toStrictEqual(rawCredential);
    expect(deserializedCred.metadata).toStrictEqual(metadata);
    expect(serializeCryptkeeperVC(deserializedCred)).toBe(serializeCryptkeeperVC(cryptkeeperCred));
  });

  test("should fail to deserialize an invalid serialized string", async () => {
    await expect(deserializeCryptkeeperVC("")).rejects.toThrow(
      "Serialized Cryptkeeper Verifiable Credential is not provided",
    );
  });
});

describe("util/serializeVP", () => {
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

    expect(serializeVP(verifiablePresentation)).toStrictEqual(
      stringify({ ...verifiablePresentation, verifiableCredential: [serializeVC(rawCredential)] }),
    );
  });

  test("should serialize a verifiable presentation with no credentials correctly", () => {
    const verifiablePresentation = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation"],
    };

    expect(serializeVP(verifiablePresentation)).toStrictEqual(stringify(verifiablePresentation));
  });
});

describe("util/deserializeVC", () => {
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
    const credJson = serializeVC(rawCredential);
    const deserializedCred = await deserializeVC(credJson);

    expect(deserializedCred).toStrictEqual(rawCredential);
    expect(serializeVC(deserializedCred)).toBe(credJson);
  });

  test("should fail to deserialize an invalid serialized string", async () => {
    await expect(deserializeVC("")).rejects.toThrow("Serialized Verifiable Credential is not provided");
  });
});

describe("util/validateSerializedVC", () => {
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
    const credJson = serializeVC(rawCredential);
    const cred = await deserializeVC(credJson);

    expect(cred).not.toBeNull();
    expect(validateSerializedVC(credJson)).not.toBeNull();
  });

  test("should correctly validate alternate issuer format", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: {
        id: "did:ethr:0x123",
      },
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: "John Doe",
        },
      },
    };
    const credJson = serializeVC(rawCredential);
    const cred = await deserializeVC(credJson);

    expect(cred).not.toBeNull();
    expect(validateSerializedVC(credJson)).not.toBeNull();
  });

  test("should correctly validate nested map claims", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          mapping: {
            a: "b",
          },
        },
      },
    };
    const credJson = serializeVC(rawCredential);
    const cred = await deserializeVC(credJson);

    expect(cred).not.toBeNull();
    expect(validateSerializedVC(credJson)).not.toBeNull();
  });

  test("should correctly validate nested array claims", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          array: ["a", "b"],
        },
      },
    };
    const credJson = serializeVC(rawCredential);
    const cred = await deserializeVC(credJson);

    expect(cred).not.toBeNull();
    expect(validateSerializedVC(credJson)).not.toBeNull();
  });

  test("should return null if the string is not valid JSON", async () => {
    const rawCredential = "asdf";
    await expect(deserializeVC(rawCredential)).rejects.toThrow(SyntaxError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the subject property does not exist", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
    };
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the claims do not consist of strings", async () => {
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
  });

  test("should return false if the claims consist of improper nested arrays", async () => {
    const rawCredential = {
      context: ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential"],
      issuer: "did:ethr:0x123",
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:ethr:0x123",
        claims: {
          name: [3, 4],
        },
      },
    };
    const credentialJson = stringify(rawCredential);

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
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

    await expect(deserializeVC(credentialJson)).rejects.toThrow(yup.ValidationError);
  });
});

describe("util/hashVC", () => {
  test("should produce deterministic hashes", () => {
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

    expect(hashVC(credOne)).toBe(hashVC(credTwo));
  });

  test("should produce the same hash after serialization/deserialization", async () => {
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
    const credJson = serializeVC(cred);
    const deserializedCred = await deserializeVC(credJson);

    expect(hashVC(cred)).toBe(hashVC(deserializedCred));
  });
});

describe("util/generateInitialMetadataForVC", () => {
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
    const metadata = generateInitialMetadataForVC(rawCredential, defaultCredentialName);
    const expectedMetadata = {
      name: "Verifiable Credential",
      hash: hashVC(rawCredential),
    };

    expect(metadata).toStrictEqual(expectedMetadata);
  });
});
