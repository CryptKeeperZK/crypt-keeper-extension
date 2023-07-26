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
 * @param obj A JSON string representing a VerifiableCredential.
 * @returns An object representing a VerifiableCredential. Null if the object is not a valid VerifiableCredential.
 */
export function parseVerifiableCredentialFromJson(json: string): VerifiableCredential | null {
  if (!json || typeof json !== "string") {
    return null;
  }

  let obj;
  try {
    obj = JSON.parse(json) as object;
  } catch (e) {
    return null;
  }

  return validateVerifiableCredential(obj);
}

/**
 * Determines if an object is a valid VerifiableCredential.
 * @param obj An object representing a VerifiableCredential.
 * @returns A boolean indicating whether or not the object is a valid VerifiableCredential.
 */
export function validateVerifiableCredential(obj: object): VerifiableCredential | null {
  const ClaimValueSchema: yup.Schema<ClaimValue> = yup
    .mixed()
    .required()
    .test("is-claim-value", "claim value must be a string, array, or object", (value) => {
      if (typeof value === "string") {
        return true;
      }
      if (Array.isArray(value)) {
        return true;
      }
      if (typeof value === "object") {
        try {
          ClaimValueSchema.validateSync(value);
          return true;
        } catch (error) {
          return false;
        }
      } else {
        return false;
      }
    });

  const CredentialSubjectSchema: yup.Schema<CredentialSubject> = yup.object({
    id: yup.string().strict().optional(),
    claims: yup.lazy((value: object) => {
      if (typeof value !== "object" || value === null) {
        return yup
          .mixed()
          .required()
          .test("is-object", "claims must be an object", () => false);
      }

      const shape: Record<string, yup.Schema> = {} as Record<string, yup.Schema>;
      Object.keys(value).forEach((key) => {
        shape[key] = ClaimValueSchema;
      });
      return yup.object().shape(shape);
    }),
  });

  const CredentialIssuerSchema: yup.Schema<CredentialIssuer> = yup.object({
    id: yup.string().strict().optional(),
  });

  const CredentialProofSchema: yup.Schema<CredentialProof> = yup.object({
    id: yup.string().strict().optional(),
    type: yup.array().strict().of(yup.string().required()).required(),
    proofPurpose: yup.string().strict().required(),
    verificationMethod: yup.string().strict().required(),
    created: yup.date().transform(parseDate).required(),
    proofValue: yup.string().strict().required(),
  });

  const CredentialStatusSchema: yup.Schema<CredentialStatus> = yup.object({
    id: yup.string().strict().required(),
    type: yup.string().strict().required(),
  });

  const VerifiableCredentialSchema: yup.Schema<VerifiableCredential> = yup.object({
    context: yup.array().strict().of(yup.string().required()).required(),
    id: yup.string().strict().optional(),
    type: yup.array().strict().of(yup.string().required()).required(),
    issuer: yup
      .mixed()
      .required()
      .test("is-string-or-CredentialIssuer", "issuer must be a string or CredentialIssuer", (value) => {
        if (typeof value === "string") {
          return true;
        }
        try {
          CredentialIssuerSchema.validateSync(value);
          return true;
        } catch (error) {
          return false;
        }
      }),
    issuanceDate: yup.date().transform(parseDate).required(),
    expirationDate: yup.date().transform(parseDate).optional(),
    credentialSubject: CredentialSubjectSchema,
    credentialStatus: yup.lazy((value) => {
      if (typeof value === "undefined") {
        return yup.object().optional();
      }
      return CredentialStatusSchema.required() as yup.Schema;
    }),
    proof: yup.array().of(CredentialProofSchema).optional(),
  });

  try {
    return VerifiableCredentialSchema.validateSync(obj);
  } catch (error) {
    return null;
  }
}

function parseDate(value: string, originalValue: string): Date | string {
  const date = new Date(originalValue);
  return Number.isNaN(date.getTime()) ? originalValue : date;
}
