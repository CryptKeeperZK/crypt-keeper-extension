export type IdentityStrategy = "interrep" | "random";

export type IdentityWeb2Provider = "twitter" | "github" | "reddit";

export type CreateIdentityOptions = {
  message: string;
  account: string;
  nonce?: number;
  web2Provider?: IdentityWeb2Provider;
  name?: string;
};

export type NewIdentityRequest = {
  strategy: IdentityStrategy;
  options: CreateIdentityOptions;
  walletType: EWallet;
  host?: string;
  messageSignature?: string;
};

export enum EWallet {
  ETH_WALLET,
  CRYPT_KEEPER_WALLET,
}

export interface IdentityMetadata {
  account: string;
  name: string;
  identityStrategy: IdentityStrategy;
  host?: string;
  web2Provider?: IdentityWeb2Provider;
  groups: GroupData[] | [];
};

export interface GroupData {
  id: string;
  name: string;
  favicon?: string;
  description?: string;
  api?: string;
  contract?: string;
}

export interface NewIdentityData {
  host: string;
  nonce: number;
  identityCommitment: string;
}

export interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

export type IdentityName = {
  identityCommitment: string;
  name: string;
};

export type SerializedIdentity = {
  metadata: IdentityMetadata;
  secret: string;
};

export interface ICreateIdentityArgs {
  identityStrategy: IdentityStrategy;
  name: string;
  account: string;
  messageSignature?: string;
  web2Provider?: IdentityWeb2Provider;
  host?: string;
  groups: GroupData[] | []
}

export type StrategiesMap = {
  random: (config: ICreateIdentityArgs) => void;
  interrep: (config: ICreateIdentityArgs) => void;
};

export interface IdentityHost {
  host: string | undefined;
}
