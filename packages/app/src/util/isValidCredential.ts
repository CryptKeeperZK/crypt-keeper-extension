import { VerifiableCredential, Issuer, CredentialsProof, Subject, Status, ClaimValue } from "@src/types";

export function isValidVerifiableCredential(obj: VerifiableCredential): boolean {
  if (!obj.context || !Array.isArray(obj.context)) {
    return false;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const context of obj.context) {
    if (typeof context !== "string") {
      return false;
    }
  }

  if (obj.id && typeof obj.id !== "string") {
    return false;
  }

  if (!obj.type || !Array.isArray(obj.type)) {
    return false;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const type of obj.type) {
    if (typeof type !== "string") {
      return false;
    }
  }

  if (
    !obj.issuer ||
    (typeof obj.issuer !== "string" && (typeof obj.issuer !== "object" || !isValidIssuer(obj.issuer)))
  ) {
    return false;
  }

  if (!obj.issuanceDate || !(obj.issuanceDate instanceof Date)) {
    return false;
  }

  if (obj.expirationDate && !(obj.expirationDate instanceof Date)) {
    return false;
  }

  if (!obj.credentialSubject || typeof obj.credentialSubject !== "object" || !isValidSubject(obj.credentialSubject)) {
    return false;
  }

  if (obj.credentialStatus && (typeof obj.credentialStatus !== "object" || !isValidStatus(obj.credentialStatus))) {
    return false;
  }

  if (obj.proof) {
    if (!Array.isArray(obj.proof)) {
      return false;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const proof of obj.proof) {
      if (typeof proof !== "object" || !isValidCredentialsProof(proof)) {
        return false;
      }
    }
  }

  return true;
}

export function isValidIssuer(obj: Issuer): boolean {
  if (obj.id && typeof ["id"] !== "string") {
    return false;
  }

  return true;
}

export function isValidSubject(obj: Subject): boolean {
  if (obj.id && typeof obj.id !== "string") {
    return false;
  }

  if (!obj.claims || typeof obj.claims !== "object" || !isValidClaims(obj.claims)) {
    return false;
  }

  return true;
}

export function isValidClaims(obj: Record<string, ClaimValue>): boolean {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    if ((typeof obj[key] !== "object" && typeof obj[key] !== "string") || !isValidClaimValue(obj[key])) {
      return false;
    }
  }

  return true;
}

export function isValidClaimValue(obj: ClaimValue): boolean {
  if (typeof obj === "string") {
    return true;
  }

  if (Array.isArray(obj)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const value of obj) {
      if ((typeof value !== "object" && typeof value !== "string") || !isValidClaimValue(value)) {
        return false;
      }
    }

    return true;
  }

  return isValidClaims(obj);
}

export function isValidStatus(obj: Status): boolean {
  if (!obj.id || typeof obj.id !== "string") {
    return false;
  }

  if (!obj.type || typeof obj.type !== "string") {
    return false;
  }

  return true;
}

export function isValidCredentialsProof(obj: CredentialsProof): boolean {
  if (obj.id && typeof obj.id !== "string") {
    return false;
  }

  if (!obj.type || !Array.isArray(obj.type)) {
    return false;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const type of obj.type) {
    if (typeof type !== "string") {
      return false;
    }
  }

  if (!obj.proofPurpose || typeof obj.proofPurpose !== "string") {
    return false;
  }

  if (!obj.verificationMethod || typeof obj.verificationMethod !== "string") {
    return false;
  }

  if (!obj.created || !(obj.created instanceof Date)) {
    return false;
  }

  if (!obj.proofValue || typeof obj.proofValue !== "string") {
    return false;
  }

  return true;
}
