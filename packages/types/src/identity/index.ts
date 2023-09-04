export type IdentityStrategy = "interep" | "random";

export type IdentityWeb2Provider = "twitter" | "github" | "reddit";

export interface ICreateIdentityOptions {
  message: string;
  account: string;
  nonce?: number;
  web2Provider?: IdentityWeb2Provider;
  name?: string;
}

export interface ICreateIdentityRequestArgs {
  host: string;
}

export interface IConnectIdentityRequestArgs {
  host: string;
}

export interface INewIdentityRequest {
  strategy: IdentityStrategy;
  options: ICreateIdentityOptions;
  walletType: EWallet;
  groups: IGroupData[];
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
  identityStrategy: IdentityStrategy;
  groups: IGroupData[];
  web2Provider?: IdentityWeb2Provider;
  host?: string;
}

export type ConnectedIdentityMetadata = Pick<IIdentityMetadata, "name" | "identityStrategy" | "web2Provider" | "host">;

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
  identityStrategy: IdentityStrategy;
  name: string;
  account: string;
  groups: IGroupData[];
  messageSignature?: string;
  web2Provider?: IdentityWeb2Provider;
  host?: string;
}

export interface IStrategiesMap {
  random: (config: ICreateIdentityArgs) => void;
  interep: (config: ICreateIdentityArgs) => void;
}
