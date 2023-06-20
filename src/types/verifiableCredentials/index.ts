export interface Credential {
  context: string[];
  id?: string;
  type: string[];
  issuer: string | Issuer;
  issuanceDate: Date;
  expirationDate?: Date;
  credentialSubject: Subject;
  credentialStatus?: Status;
}

export interface VerifiableCredential extends Credential {
  proof?: CredentialsProof[];
}

export interface Presentation {
  context: string[];
  id?: string;
  type: string[];
  verifiableCredential?: VerifiableCredential[];
  holder?: string;
}

export interface VerifiablePresentation extends Presentation {
  proof?: CredentialsProof[];
}

export interface Issuer {
  id?: string;
}

export interface Subject {
  id?: string;
  claims: Record<string, ClaimValue>;
}

export interface Status {
  id: string;
  type: string;
}

export type ClaimValue = string | ClaimValue[] | { [key: string]: ClaimValue };

export interface CredentialsProof {
  id?: string;
  type: string[];
  proofPurpose: string;
  verificationMethod: string;
  created: Date;
  proofValue: string;
}
