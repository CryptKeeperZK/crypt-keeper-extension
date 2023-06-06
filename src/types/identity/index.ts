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
  groups: GroupData[];
}

export interface GroupData {
  id: string;
  name: string;
  favicon?: string;
  description?: string;
  api?: string;
  contract?: string;
}

// TODO: now it always returns `identityCommitment` but we should eliminate this, so this feature will be done in another PR
//       becuase it needs to build `cryptkeeper.requestIdentityCommitment()` which is out of the scope of this PR.
export interface ConnectedIdentityData {
  identityCommitment: string;
  // nonce: number; // TODO: will be supported in another PR
  host: string; // TODO: maybe we should rename it to `origin` to be the same with `window.location.origin`
  groups: GroupData[];
}

export interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

export type IdentityName = {
  identityCommitment: string;
  name: string;
};

export type IdentityHost = {
  identityCommitment: string;
  host: string;
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
  groups: GroupData[];
}

export type StrategiesMap = {
  random: (config: ICreateIdentityArgs) => void;
  interrep: (config: ICreateIdentityArgs) => void;
};
