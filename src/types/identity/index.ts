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

export type IdentityMetadata = {
  account: string;
  name: string;
  identityStrategy: IdentityStrategy;
  host?: string;
  web2Provider?: IdentityWeb2Provider;
};

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
}

export type StrategiesMap = {
  random: (config: ICreateIdentityArgs) => void;
  interrep: (config: ICreateIdentityArgs) => void;
};

export interface IdentityHost {
  host: string | undefined 
}
