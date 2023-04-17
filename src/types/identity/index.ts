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
