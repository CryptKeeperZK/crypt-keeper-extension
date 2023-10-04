export interface ICreateIdentityOptions {
  message: string;
  account: string;
  nonce: number;
  name?: string;
}

export interface ICreateIdentityRequestArgs {
  urlOrigin: string;
}

export interface IConnectIdentityRequestArgs {
  urlOrigin: string;
}

export interface INewIdentityRequest {
  options: ICreateIdentityOptions;
  walletType: EWallet;
  groups: IGroupData[];
  isDeterministic: boolean;
  urlOrigin?: string;
  messageSignature?: string;
}

export enum EWallet {
  ETH_WALLET,
  CRYPTKEEPER_WALLET,
}

export interface IIdentityMetadata {
  account: string;
  name: string;
  groups: IGroupData[];
  isDeterministic: boolean;
  nonce?: number;
  urlOrigin?: string;
}

export type ConnectedIdentityMetadata = Pick<IIdentityMetadata, "name" | "urlOrigin">;

export interface IGroupData {
  id: string;
  name: string;
  favicon?: string;
  description?: string;
  api?: string;
  contract?: string;
}

export interface IIdentityData {
  commitment: string;
  metadata: IIdentityMetadata;
}

export interface ISetIdentityNameArgs {
  identityCommitment: string;
  name: string;
}

export interface ISetIdentityHostArgs {
  identityCommitment: string;
  urlOrigin: string;
}

export interface IConnectIdentityArgs {
  identityCommitment: string;
  urlOrigin: string;
}

export interface ISerializedIdentity {
  metadata: IIdentityMetadata;
  secret: string;
}

export interface ICreateIdentityArgs {
  name: string;
  account: string;
  groups: IGroupData[];
  isDeterministic: boolean;
  messageSignature?: string;
  nonce?: number;
  urlOrigin?: string;
}
