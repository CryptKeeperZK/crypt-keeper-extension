export interface ICreateIdentityOptions {
  message: string;
  account: string;
  nonce: number;
  name?: string;
}

export interface ICreateIdentityRequestArgs {
  urlOrigin: string;
}

export interface IImportIdentityRequestArgs {
  trapdoor: string;
  nullifier: string;
}

export interface INewIdentityRequest {
  options: ICreateIdentityOptions;
  walletType: EWallet;
  groups: IGroupData[];
  isDeterministic: boolean;
  urlOrigin?: string;
  messageSignature?: string;
}

export interface IImportIdentityArgs {
  name: string;
  trapdoor: string;
  nullifier: string;
  messageSignature: string;
  urlOrigin?: string;
}

export enum EWallet {
  CRYPTKEEPER_WALLET,
  ETH_WALLET,
}

export interface IIdentityMetadata {
  name: string;
  groups: IGroupData[];
  isDeterministic: boolean;
  isImported: boolean;
  account?: string;
  nonce?: number;
}

export type ConnectedIdentityMetadata = Pick<IIdentityMetadata, "name">;

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

export interface IConnectIdentityArgs {
  commitment: string;
  urlOrigin: string;
}

export interface ISerializedIdentity {
  metadata: IIdentityMetadata;
  secret: string;
}

export interface ICreateIdentityArgs {
  name: string;
  groups: IGroupData[];
  isDeterministic: boolean;
  isImported: boolean;
  account?: string;
  messageSignature?: string;
  nonce?: number;
  urlOrigin?: string;
  trapdoor?: string;
  nullifier?: string;
}

export interface IIdentityConnection {
  commitment: string;
  name: string;
  urlOrigin: string;
}

export interface IConnectArgs {
  commitment: string;
}

export interface IRevealConnectedIdentityCommitmentArgs {
  url?: string;
}

export interface IDeleteIdentityArgs {
  identityCommitment: string;
}
