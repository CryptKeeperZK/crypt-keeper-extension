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
  serialized: string;
  name: string;
}

export interface IRenameVerifiableCredentialArgs {
  hash: string;
  name: string;
}

export interface IGenerateVerifiablePresentationWithCryptkeeperArgs {
  verifiablePresentation: IVerifiablePresentation;
  address: string;
  created?: Date;
}
