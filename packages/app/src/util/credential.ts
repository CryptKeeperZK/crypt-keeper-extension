import * as yup from "yup";

import {
  VerifiableCredential,
  CredentialIssuer,
  CredentialProof,
  CredentialSubject,
  CredentialStatus,
  ClaimValue,
} from "@src/types";

/**
 * Attempts to parse a JSON string into a VerifiableCredential object.
 * @param json A JSON string representing a VerifiableCredential.
 * @returns An object representing a VerifiableCredential. Null if the object is not a valid VerifiableCredential.
 */
export async function parseVerifiableCredentialFromJson(json: string): Promise<VerifiableCredential | null> {
  if (!json) {
    return null;
  }

  try {
    return await validateVerifiableCredential(JSON.parse(json) as Record<string, unknown>);
  } catch (e) {
    return null;
  }
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
 * @param obj An object representing a VerifiableCredential.
 * @returns A boolean indicating whether or not the object is a valid VerifiableCredential.
 */
export async function validateVerifiableCredential(obj: object): Promise<VerifiableCredential | null> {
  try {
    return await verifiableCredentialSchema.validate(obj);
  } catch (error) {
    return null;
  }
}

function parseDate(value: string, originalValue: string): Date | string {
  const date = new Date(originalValue);
  return Number.isNaN(date.getTime()) ? originalValue : date;
}
