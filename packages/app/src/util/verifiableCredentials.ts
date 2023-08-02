import {
  CredentialSubject,
  CryptkeeperVerifiableCredential,
  FlattenedCredentialSubject,
  FlattenedCryptkeeperVerifiableCredential,
  FlattenedVerifiableCredential,
  VerifiableCredential,
} from "@src/types";

export function flattenCryptkeeperVerifiableCredential(
  cryptkeeperVerifiableCredential: CryptkeeperVerifiableCredential,
): FlattenedCryptkeeperVerifiableCredential {
  return {
    verifiableCredential: flattenVerifiableCredential(cryptkeeperVerifiableCredential.verifiableCredential),
    metadata: cryptkeeperVerifiableCredential.metadata,
  };
}

export function flattenVerifiableCredential(verifiableCredential: VerifiableCredential): FlattenedVerifiableCredential {
  return {
    context: verifiableCredential.context,
    id: verifiableCredential.id,
    type: verifiableCredential.type,
    issuer: verifiableCredential.issuer,
    issuanceDate: verifiableCredential.issuanceDate,
    expirationDate: verifiableCredential.expirationDate,
    credentialSubject: flattenVerifiableCredentialSubject(verifiableCredential.credentialSubject),
    credentialStatus: verifiableCredential.credentialStatus,
    proof: verifiableCredential.proof,
  };
}

export function flattenVerifiableCredentialSubject(credentialSubject: CredentialSubject): FlattenedCredentialSubject {
  // TODO: Implement flattening of verifiable credential subject.
  return {
    id: credentialSubject.id,
    claims: {} as Record<string, string>,
  };
}
