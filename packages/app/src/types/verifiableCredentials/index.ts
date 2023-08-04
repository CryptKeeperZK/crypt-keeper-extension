import { VerifiableCredential } from "@cryptkeeperzk/types";

export interface VerifiableCredentialMetadata {
  name: string;
  hash: string;
}
export interface CryptkeeperVerifiableCredential {
  verifiableCredential: VerifiableCredential;
  metadata: VerifiableCredentialMetadata;
}
