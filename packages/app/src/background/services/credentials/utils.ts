import {
  IVerifiableCredential,
  ICredentialIssuer,
  ICredentialProof,
  ICredentialSubject,
  ICredentialStatus,
  ClaimValue,
  IVerifiablePresentation,
} from "@cryptkeeperzk/types";
import { SHA256 } from "crypto-js";
import stringify from "json-stable-stringify";
import * as yup from "yup";

import { ICryptkeeperVerifiableCredential, IVerifiableCredentialMetadata } from "@src/types";

let claimValueSchema: yup.Schema<ClaimValue>;

const claimValueMapSchema = yup.lazy((value: Record<string, unknown> | null | undefined) => {
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

const credentialSubjectSchema: yup.Schema<ICredentialSubject> = yup.object({
  id: yup.string().strict().optional(),
  claims: claimValueMapSchema,
});

const credentialIssuerSchema: yup.Schema<ICredentialIssuer> = yup.object({
  id: yup.string().strict().optional(),
});

const credentialProofSchema: yup.Schema<ICredentialProof> = yup.object({
  id: yup.string().strict().optional(),
  type: yup.array().strict().of(yup.string().required()).required(),
  proofPurpose: yup.string().strict().required(),
  verificationMethod: yup.string().strict().required(),
  created: yup.date().transform(parseDate).required(),
  proofValue: yup.string().strict().required(),
});

const credentialStatusSchema: yup.Schema<ICredentialStatus> = yup.object({
  id: yup.string().strict().required(),
  type: yup.string().strict().required(),
});

const verifiableCredentialSchema: yup.Schema<IVerifiableCredential> = yup.object({
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

      return credentialIssuerSchema
        .validate(value)
        .then(() => true)
        .catch(() => false);
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
    throw new Error("Serialized Cryptkeeper Verifiable Credential is not provided");
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
  const date = new Date(originalValue);
  return Number.isNaN(date.getTime()) ? originalValue : date;
}
