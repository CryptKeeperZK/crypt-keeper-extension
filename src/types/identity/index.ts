export type IdentityStrategy = "interrep" | "random";

export type IdentityWeb2Provider = "twitter" | "github" | "reddit";

export type CreateIdentityOptions = {
  nonce?: number;
  web2Provider?: IdentityWeb2Provider;
  account?: string;
  name?: string;
};

export type NewIdentityRequest = {
  strategy: IdentityStrategy;
  messageSignature: string;
  options: CreateIdentityOptions;
};

export type IdentityMetadata = {
  account: string;
  name: string;
  identityStrategy: IdentityStrategy;
  web2Provider?: IdentityWeb2Provider;
};

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
}

export type StrategiesMap = {
  random: (config: ICreateIdentityArgs) => void;
  interrep: (config: ICreateIdentityArgs) => void;
};
