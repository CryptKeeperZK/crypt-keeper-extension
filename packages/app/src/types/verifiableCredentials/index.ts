import type { IVerifiableCredential, IVerifiablePresentation } from "@cryptkeeperzk/types";

export interface IVerifiableCredentialMetadata {
  name: string;
  hash: string;
}

export interface ICryptkeeperVerifiableCredential {
  vc: IVerifiableCredential;
  metadata: IVerifiableCredentialMetadata;
}

export interface IAddVCArgs {
  serialized: string;
  name: string;
}

export interface IRenameVCArgs {
  hash: string;
  newName: string;
}

export interface ISignVPArgs {
  vp: IVerifiablePresentation;
  address: string;
}
