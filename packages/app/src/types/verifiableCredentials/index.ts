import type { IVerifiableCredential, IVerifiablePresentation } from "@cryptkeeperzk/types";

export interface IVerifiableCredentialMetadata {
  name: string;
  hash: string;
}

export interface ICryptkeeperVerifiableCredential {
  verifiableCredential: IVerifiableCredential;
  metadata: IVerifiableCredentialMetadata;
}

export interface IAddVerifiableCredentialArgs {
  serializedVerifiableCredential: string;
  verifiableCredentialName: string;
}

export interface IRenameVerifiableCredentialArgs {
  verifiableCredentialHash: string;
  newVerifiableCredentialName: string;
}

export interface IGenerateVerifiablePresentationWithCryptkeeperArgs {
  verifiablePresentation: IVerifiablePresentation;
  address: string;
  created?: Date;
}
