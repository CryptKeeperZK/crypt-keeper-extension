import { VerifiableCredential } from "@cryptkeeperzk/types";

export interface VerifiableCredentialMetadata {
  name: string;
  hash: string;
}

export interface CryptkeeperVerifiableCredential {
  verifiableCredential: VerifiableCredential;
  metadata: VerifiableCredentialMetadata;
}

export interface IAddVerifiableCredentialArgs {
  serializedVerifiableCredential: string;
  verifiableCredentialName: string;
}

export interface IRenameVerifiableCredentialArgs {
  verifiableCredentialHash: string;
  newVerifiableCredentialName: string;
}
