import { SHA256 } from "crypto-js";
import stringify from "json-stable-stringify";
import { type Schema, mixed, lazy, string, object, array, date } from "yup";

import type {
  IVerifiableCredential,
  ICredentialIssuer,
  ICredentialProof,
  ICredentialSubject,
  ICredentialStatus,
  ClaimValue,
  IVerifiablePresentation,
} from "@cryptkeeperzk/types";
import type { ICryptkeeperVerifiableCredential, IVerifiableCredentialMetadata } from "@src/types";

let claimValueSchema: Schema<ClaimValue>;

const claimValueMapSchema = lazy((value: Record<string, unknown> | null | undefined) => {
  if (typeof value !== "object" || value === null) {
    return mixed()
      .required()
      .test("is-object", "claims must be an object", () => false);
  }

  const shape = {} as Record<string, Schema>;
  Object.keys(value).forEach((key) => {
    shape[key] = claimValueSchema;
  });
  return object().shape(shape);
});

claimValueSchema = mixed()
  .required()
  .test("is-claim-value", "claim value must be a string, array, or object", async (value) => {
    if (typeof value === "string") {
      return true;
    }

    if (Array.isArray(value)) {
      const validationResults = await Promise.all(
        value.map(async (item) =>
          claimValueSchema
            .validate(item)
            .then(() => true)
            .catch(() => false),
        ),
      );

      return validationResults.every((result) => result);
    }

    return claimValueMapSchema
      .validate(value)
      .then(() => true)
      .catch(() => false);
  });

const credentialSubjectSchema: Schema<ICredentialSubject> = object({
  id: string().strict().optional(),
  claims: claimValueMapSchema,
});

const credentialIssuerSchema: Schema<ICredentialIssuer> = object({
  id: string().strict().optional(),
});

const credentialProofSchema: Schema<ICredentialProof> = object({
  id: string().strict().optional(),
  type: array().strict().of(string().required()).required(),
  proofPurpose: string().strict().required(),
  verificationMethod: string().strict().required(),
  created: date().transform(parseDate).required(),
  proofValue: string().strict().required(),
});

const credentialStatusSchema: Schema<ICredentialStatus> = object({
  id: string().strict().required(),
  type: string().strict().required(),
});

const verifiableCredentialSchema: Schema<IVerifiableCredential> = object({
  context: array().strict().of(string().required()).required(),
  id: string().strict().optional(),
  type: array().strict().of(string().required()).required(),
  issuer: mixed()
    .required()
    .test("is-string-or-CredentialIssuer", "issuer must be a string or CredentialIssuer", async (value) => {
      if (typeof value === "string") {
        return true;
      }

      return credentialIssuerSchema
        .validate(value)
        .then(() => true)
        .catch(() => false);
    }),
  issuanceDate: date().transform(parseDate).required(),
  expirationDate: date().transform(parseDate).optional(),
  credentialSubject: credentialSubjectSchema,
  credentialStatus: lazy((value) => {
    if (!value) {
      return object().optional();
    }

    return credentialStatusSchema.required() as Schema;
  }),
  proof: array().of(credentialProofSchema).optional(),
});

/**
 * Serializes a CryptkeeperVerifiableCredential object into a JSON string.
 * @param cryptkeeperVerifiableCredential An object representing a CryptkeeperVerifiableCredential.
 * @returns A string representing a CryptkeeperVerifiableCredential.
 */
export function serializeCryptkeeperVerifiableCredential(
  cryptkeeperVerifiableCredential: ICryptkeeperVerifiableCredential,
): string {
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
): Promise<ICryptkeeperVerifiableCredential> {
  if (!serializedCryptkeeperVerifiableCredential) {
    throw new Error("Serialized CryptKeeper Verifiable Credential is not provided");
  }

  const parsedCryptkeeperVerifiableCredential = JSON.parse(serializedCryptkeeperVerifiableCredential) as {
    verifiableCredential: string;
    metadata: IVerifiableCredentialMetadata;
  };

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
 */
export function serializeVerifiableCredential(verifiableCredential: IVerifiableCredential): string {
  return stringify(verifiableCredential);
}

/**
 * Attempts to parse a JSON string into a VerifiableCredential object.
 * @param serializedVerifiableCredential A JSON string representing a VerifiableCredential.
 * @returns An object representing a VerifiableCredential. Throws error if the object is not a valid VerifiableCredential.
 */
export async function deserializeVerifiableCredential(
  serializedVerifiableCredential: string,
): Promise<IVerifiableCredential> {
  if (!serializedVerifiableCredential) {
    throw new Error("Serialized Verifiable Credential is not provided");
  }

  const deserializedVerifiableCredential = JSON.parse(serializedVerifiableCredential) as IVerifiableCredential;

  return verifiableCredentialSchema.validate(deserializedVerifiableCredential);
}

/**
 * Serializes a VerifiablePresentation object into a JSON string.
 * @param verifiablePresentation An object representing a VerifiablePresentation.
 * @returns A string representing a VerifiablePresentation.
 */
export function serializeVerifiablePresentation(verifiablePresentation: IVerifiablePresentation): string {
  if (!verifiablePresentation.verifiableCredential) {
    return stringify(verifiablePresentation);
  }

  const serializedVerifiableCredentials = verifiablePresentation.verifiableCredential.map((verifiableCredential) =>
    serializeVerifiableCredential(verifiableCredential),
  );

  return stringify({
    ...verifiablePresentation,
    verifiableCredential: serializedVerifiableCredentials,
  });
}

/**
 * Determines if a string represents a valid VerifiableCredential.
 * @param serializedVerifiableCredential An string representing a VerifiableCredential.
 * @returns The string if it is a valid VerifiableCredential, otherwise throws an error.
 */
export async function validateSerializedVerifiableCredential(serializedVerifiableCredential: string): Promise<string> {
  await deserializeVerifiableCredential(serializedVerifiableCredential);

  return serializedVerifiableCredential;
}

/**
 * Generates a hash of a VerifiableCredential.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns A string representing the hash of the VerifiableCredential.
 */
export function hashVerifiableCredential(verifiableCredential: IVerifiableCredential): string {
  return SHA256(serializeVerifiableCredential(verifiableCredential)).toString();
}

/**
 * Generates initial metadata for a VerifiableCredential.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns An object representing the initial metadata for the VerifiableCredential.
 */
export function generateInitialMetadataForVerifiableCredential(
  verifiableCredential: IVerifiableCredential,
  initialVerifiableCredentialName: string,
): IVerifiableCredentialMetadata {
  return {
    name: initialVerifiableCredentialName,
    hash: hashVerifiableCredential(verifiableCredential),
  };
}

export function generateVerifiablePresentationFromVerifiableCredentials(
  verifiableCredentials: IVerifiableCredential[],
): IVerifiablePresentation {
  return {
    context: ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    verifiableCredential: verifiableCredentials,
  };
}

function parseDate(_: string, originalValue: string): Date | string {
  const value = new Date(originalValue);
  return Number.isNaN(value.getTime()) ? originalValue : value;
}
