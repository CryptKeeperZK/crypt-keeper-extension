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
 * @param cryptkeeperVC An object representing a CryptkeeperVerifiableCredential.
 * @returns A string representing a CryptkeeperVerifiableCredential.
 */
export function serializeCryptkeeperVC(cryptkeeperVC: ICryptkeeperVerifiableCredential): string {
  return JSON.stringify({
    vc: serializeVC(cryptkeeperVC.vc),
    metadata: cryptkeeperVC.metadata,
  });
}

/**
 * Deserializes a CryptkeeperVerifiableCredential JSON string into a CryptkeeperVerifiableCredential object.
 * @param serialized A JSON string representing a CryptkeeperVerifiableCredential.
 * @returns A CryptkeeperVerifiableCredential object. Throws error if the object is not a valid CryptkeeperVerifiableCredential.
 */
export async function deserializeCryptkeeperVC(serialized: string): Promise<ICryptkeeperVerifiableCredential> {
  if (!serialized) {
    throw new Error("Serialized Cryptkeeper Verifiable Credential is not provided");
  }

  const parsedCryptkeeperVC = JSON.parse(serialized) as {
    vc: string;
    metadata: IVerifiableCredentialMetadata;
  };

  return {
    vc: await deserializeVC(parsedCryptkeeperVC.vc),
    metadata: parsedCryptkeeperVC.metadata,
  };
}

/**
 * Serializes a VerifiableCredential object into a JSON string.
 * @param vc An object representing a VerifiableCredential.
 * @returns A string representing a VerifiableCredential.
 */
export function serializeVC(vc: IVerifiableCredential): string {
  return stringify(vc);
}

/**
 * Attempts to parse a JSON string into a VerifiableCredential object.
 * @param serialized A JSON string representing a VerifiableCredential.
 * @returns An object representing a VerifiableCredential. Throws error if the object is not a valid VerifiableCredential.
 */
export async function deserializeVC(serialized: string): Promise<IVerifiableCredential> {
  if (!serialized) {
    throw new Error("Serialized Verifiable Credential is not provided");
  }

  const deserializedVC = JSON.parse(serialized) as IVerifiableCredential;

  return verifiableCredentialSchema.validate(deserializedVC);
}

/**
 * Serializes a VerifiablePresentation object into a JSON string.
 * @param vp An object representing a VerifiablePresentation.
 * @returns A string representing a VerifiablePresentation.
 */
export function serializeVP(vp: IVerifiablePresentation): string {
  if (!vp.verifiableCredential) {
    return stringify(vp);
  }

  const serializedVCs = vp.verifiableCredential.map((verifiableCredential) => serializeVC(verifiableCredential));

  return stringify({
    ...vp,
    verifiableCredential: serializedVCs,
  });
}

/**
 * Determines if a string represents a valid VerifiableCredential.
 * @param serialized An string representing a VerifiableCredential.
 * @returns The string if it is a valid VerifiableCredential, otherwise throws an error.
 */
export async function validateSerializedVC(serialized: string): Promise<string> {
  await deserializeVC(serialized);

  return serialized;
}

/**
 * Generates a hash of a VerifiableCredential.
 * @param verifiableCredential An object representing a VerifiableCredential.
 * @returns A string representing the hash of the VerifiableCredential.
 */
export function hashVC(vc: IVerifiableCredential): string {
  return SHA256(serializeVC(vc)).toString();
}

/**
 * Generates initial metadata for a VerifiableCredential.
 * @param vc An object representing a VerifiableCredential.
 * @returns An object representing the initial metadata for the VerifiableCredential.
 */
export function generateInitialMetadataForVC(
  vc: IVerifiableCredential,
  initialName: string,
): IVerifiableCredentialMetadata {
  return {
    name: initialName,
    hash: hashVC(vc),
  };
}

/**
 * Generates a VerifiablePresentation from a list of VerifiableCredential objects.
 * @param vcs An array of objects representing Verifiable Credentials.
 * @returns An object representing a VerifiablePresentation.
 */
export function generateVPFromVC(vcs: IVerifiableCredential[]): IVerifiablePresentation {
  return {
    context: ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    verifiableCredential: vcs,
  };
}

function parseDate(_: string, originalValue: string): Date | string {
  const date = new Date(originalValue);
  return Number.isNaN(date.getTime()) ? originalValue : date;
}
