export interface ICreateIdentityOptions {
  message: string;
  account: string;
  nonce: number;
  name?: string;
}

export interface ICreateIdentityRequestArgs {
  host: string;
}

export interface IConnectIdentityRequestArgs {
  host: string;
}

export interface INewIdentityRequest {
  options: ICreateIdentityOptions;
  walletType: EWallet;
  groups: IGroupData[];
  isDeterministic: boolean;
  host?: string;
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
  host?: string;
  nonce?: number;
}

export type ConnectedIdentityMetadata = Pick<IIdentityMetadata, "name" | "host">;

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
  host: string;
}

export interface IConnectIdentityArgs {
  identityCommitment: string;
  host: string;
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
  host?: string;
  nonce?: number;
}
