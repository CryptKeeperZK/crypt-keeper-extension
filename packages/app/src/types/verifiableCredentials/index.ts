import { CredentialIssuer, CredentialProof, CredentialStatus, VerifiableCredential } from "@cryptkeeperzk/types";

export interface VerifiableCredentialMetadata {
  name: string;
  hash: string;
}

export interface CryptkeeperVerifiableCredential {
  verifiableCredential: VerifiableCredential;
  metadata: VerifiableCredentialMetadata;
}

export interface FlattenedCredentialSubject {
  id?: string;
  claims: Record<string, string>;
}

export interface FlattenedVerifiableCredential {
  context: string[];
  id?: string;
  type: string[];
  issuer: string | CredentialIssuer;
  issuanceDate: Date;
  expirationDate?: Date;
  credentialSubject: FlattenedCredentialSubject;
  credentialStatus?: CredentialStatus;
  proof?: CredentialProof[];
}

export interface FlattenedCryptkeeperVerifiableCredential {
  verifiableCredential: FlattenedVerifiableCredential;
  metadata: VerifiableCredentialMetadata;
}
