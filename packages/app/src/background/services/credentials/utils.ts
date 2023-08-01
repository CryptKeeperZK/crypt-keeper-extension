import { SHA256 } from "crypto-js";
import stringify from "json-stable-stringify";
import * as yup from "yup";

import {
  VerifiableCredential,
  CredentialIssuer,
  CredentialProof,
  CredentialSubject,
  CredentialStatus,
  ClaimValue,
  CryptkeeperVerifiableCredential,
  VerifiableCredentialMetadata,
} from "@src/types";

const DEFAULT_VERIFIABLE_CREDENTIAL_NAME = "Verifiable Credential";

/**
 * Serializes a CryptkeeperVerifiableCredential object into a JSON string.
 * @param cryptkeeperVerifiableCredential An object representing a CryptkeeperVerifiableCredential.
 * @returns A string representing a CryptkeeperVerifiableCredential.
 */
export function serializeCryptkeeperVerifiableCredential(
  cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential,
): string {
  if (!cryptkeeperVerifiableCredential) {
    throw new Error("Cryptkeeper Verifiable Credential is not provided!");
  }

  return JSON.stringify({
    verifiableCredential: serializeVerifiableCredential(cryptkeeperVerifiableCredential.verifiableCredential),
    metadata: cryptkeeperVerifiableCredential.metadata,
  });
}

/**
 * Deserializes a CryptkeeperVerifiableCredential JSON string into a CryptkeeperVerifiableCredential object.
 * @param serializedCryptkeeperVerifiableCredential A JSON string representing a CryptkeeperVerifiableCredential.
 * @returns A CryptkeeperVerifiableCredential object. Throws error if the object is not a valid CryptkeeperVerifiableCredential.
 */
export async function deserializeCryptkeeperVerifiableCredential(
  serializedCryptkeeperVerifiableCredential: string,
): Promise<CryptkeeperVerifiableCredential> {
  if (!serializedCryptkeeperVerifiableCredential) {
    throw new Error("Serialized Cryptkeeper Verifiable Credential is not provided!");
  }

  let parsedCryptkeeperVerifiableCredential;
  try {
    parsedCryptkeeperVerifiableCredential = JSON.parse(serializedCryptkeeperVerifiableCredential) as {
      verifiableCredential: string;
      metadata: VerifiableCredentialMetadata;
    };
  } catch (error) {
    throw new Error(`Serialized Cryptkeeper Verifiable Credential is not valid JSON: ${(error as Error).message}`);
  }

  return {
    verifiableCredential: await deserializeVerifiableCredential(
      parsedCryptkeeperVerifiableCredential.verifiableCredential,
    ),
    metadata: parsedCryptkeeperVerifiableCredential.metadata,
  };
}

/**
 * Serializes a VerifiableCredential object into a JSON string.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns A string representing a VerifiableCredential.
 * @throws Error if the VerifiableCredential is not provided.
 */
export function serializeVerifiableCredential(verifiableCredential: VerifiableCredential): string {
  if (!verifiableCredential) {
    throw new Error("Verifiable Credential is not provided!");
  }

  return stringify(verifiableCredential);
}

/**
 * Attempts to parse a JSON string into a VerifiableCredential object.
 * @param serializedVerifiableCredential A JSON string representing a VerifiableCredential.
 * @returns An object representing a VerifiableCredential. Throws error if the object is not a valid VerifiableCredential.
 */
export async function deserializeVerifiableCredential(
  serializedVerifiableCredential: string,
): Promise<VerifiableCredential> {
  if (!serializedVerifiableCredential) {
    throw new Error("Serialized Verifiable Credential is not provided!");
  }

  let deserializedVerifiableCredential;
  try {
    deserializedVerifiableCredential = JSON.parse(serializedVerifiableCredential) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Serialized Verifiable Credential is not valid JSON: ${(error as Error).message}`);
  }

  return validateVerifiableCredential(deserializedVerifiableCredential);
}

let claimValueSchema: yup.Schema<ClaimValue>;

const claimValueMapSchema = yup.lazy((value: Record<string, unknown>) => {
  if (typeof value !== "object" || value === null) {
    return yup
      .mixed()
      .required()
      .test("is-object", "claims must be an object", () => false);
  }

  const shape = {} as Record<string, yup.Schema>;
  Object.keys(value).forEach((key) => {
    shape[key] = claimValueSchema;
  });
  return yup.object().shape(shape);
});

claimValueSchema = yup
  .mixed()
  .required()
  .test("is-claim-value", "claim value must be a string, array, or object", async (value) => {
    if (typeof value === "string") {
      return true;
    }

    if (Array.isArray(value)) {
      const validationResults = await Promise.all(
        value.map(async (item) => {
          try {
            await claimValueSchema.validate(item);
            return true;
          } catch (error) {
            return false;
          }
        }),
      );
      return validationResults.every((result) => result);
    }

    try {
      await claimValueMapSchema.validate(value);
      return true;
    } catch (error) {
      return false;
    }
  });

const credentialSubjectSchema: yup.Schema<CredentialSubject> = yup.object({
  id: yup.string().strict().optional(),
  claims: claimValueMapSchema,
});

const credentialIssuerSchema: yup.Schema<CredentialIssuer> = yup.object({
  id: yup.string().strict().optional(),
});

const credentialProofSchema: yup.Schema<CredentialProof> = yup.object({
  id: yup.string().strict().optional(),
  type: yup.array().strict().of(yup.string().required()).required(),
  proofPurpose: yup.string().strict().required(),
  verificationMethod: yup.string().strict().required(),
  created: yup.date().transform(parseDate).required(),
  proofValue: yup.string().strict().required(),
});

const credentialStatusSchema: yup.Schema<CredentialStatus> = yup.object({
  id: yup.string().strict().required(),
  type: yup.string().strict().required(),
});

const verifiableCredentialSchema: yup.Schema<VerifiableCredential> = yup.object({
  context: yup.array().strict().of(yup.string().required()).required(),
  id: yup.string().strict().optional(),
  type: yup.array().strict().of(yup.string().required()).required(),
  issuer: yup
    .mixed()
    .required()
    .test("is-string-or-CredentialIssuer", "issuer must be a string or CredentialIssuer", async (value) => {
      if (typeof value === "string") {
        return true;
      }

      try {
        await credentialIssuerSchema.validate(value);
        return true;
      } catch (error) {
        return false;
      }
    }),
  issuanceDate: yup.date().transform(parseDate).required(),
  expirationDate: yup.date().transform(parseDate).optional(),
  credentialSubject: credentialSubjectSchema,
  credentialStatus: yup.lazy((value) => {
    if (!value) {
      return yup.object().optional();
    }

    return credentialStatusSchema.required() as yup.Schema;
  }),
  proof: yup.array().of(credentialProofSchema).optional(),
});

/**
 * Determines if an object is a valid VerifiableCredential.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns The Verifiable Credential if the object is a valid VerifiableCredential, otherwise throws an error.
 */
export async function validateVerifiableCredential(verifiableCredential: object): Promise<VerifiableCredential> {
  try {
    return await verifiableCredentialSchema.validate(verifiableCredential);
  } catch (error) {
    throw new Error(`Invalid Verifiable Credential: ${(error as Error).message}`);
  }
}

/**
 * Generates a hash of a VerifiableCredential.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns A string representing the hash of the VerifiableCredential.
 */
export function hashVerifiableCredential(verifiableCredential: VerifiableCredential): string {
  return SHA256(serializeVerifiableCredential(verifiableCredential)).toString();
}

/**
 * Generates initial metadata for a VerifiableCredential.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns An object representing the initial metadata for the VerifiableCredential.
 */
export function generateInitialMetadataForVerifiableCredential(
  verifiableCredential: VerifiableCredential,
): VerifiableCredentialMetadata {
  return {
    name: DEFAULT_VERIFIABLE_CREDENTIAL_NAME,
    hash: hashVerifiableCredential(verifiableCredential),
  };
}

function parseDate(value: string, originalValue: string): Date | string {
  const date = new Date(originalValue);
  return Number.isNaN(date.getTime()) ? originalValue : date;
}
