import type { IVerifiableCredential, IVerifiablePresentation } from "@cryptkeeperzk/types";

export interface IVerifiableCredentialMetadata {
  name: string;
  hash: string;
}

export interface ICryptkeeperVerifiableCredential {
  verifiableCredential: IVerifiableCredential;
  metadata: IVerifiableCredentialMetadata;
}

export interface IAddVCArgs {
  serializedVerifiableCredential: string;
  verifiableCredentialName: string;
}

export interface IRenameVCArgs {
  verifiableCredentialHash: string;
  newVerifiableCredentialName: string;
}

export interface ISignVPArgs {
  verifiablePresentation: IVerifiablePresentation;
  address: string;
}
