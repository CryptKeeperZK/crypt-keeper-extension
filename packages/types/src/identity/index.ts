export type IdentityStrategy = "interrep" | "random";

export type IdentityWeb2Provider = "twitter" | "github" | "reddit";

export interface CreateIdentityOptions {
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

export interface NewIdentityRequest {
  strategy: IdentityStrategy;
  options: CreateIdentityOptions;
  walletType: EWallet;
  groups: GroupData[];
  host?: string;
  messageSignature?: string;
}

export enum EWallet {
  ETH_WALLET,
  CRYPTKEEPER_WALLET,
}

export interface IdentityMetadata {
  account: string;
  name: string;
  identityStrategy: IdentityStrategy;
  groups: GroupData[];
  web2Provider?: IdentityWeb2Provider;
  host?: string;
}

export type ConnectedIdentityMetadata = Pick<IdentityMetadata, "name" | "identityStrategy" | "web2Provider" | "host">;

export interface GroupData {
  id: string;
  name: string;
  favicon?: string;
  description?: string;
  api?: string;
  contract?: string;
}

export interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

export interface SetIdentityNameArgs {
  identityCommitment: string;
  name: string;
}

export interface SetIdentityHostArgs {
  identityCommitment: string;
  host: string;
}

export interface ConnectIdentityArgs {
  identityCommitment: string;
  host: string;
}

export interface SerializedIdentity {
  metadata: IdentityMetadata;
  secret: string;
}

export interface ICreateIdentityArgs {
  identityStrategy: IdentityStrategy;
  name: string;
  account: string;
  groups: GroupData[];
  messageSignature?: string;
  web2Provider?: IdentityWeb2Provider;
  host?: string;
}

export interface StrategiesMap {
  random: (config: ICreateIdentityArgs) => void;
  interrep: (config: ICreateIdentityArgs) => void;
}
