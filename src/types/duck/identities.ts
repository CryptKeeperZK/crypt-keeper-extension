import type { CreateIdentityOptions, EWallet, IdentityStrategy } from "../identity";

// TODO: rename it to `ConnectedIdentity` after removing the activeIdentity feature
export interface SelectedIdentity {
  commitment: string;
  web2Provider?: string; // TODO: web2provider should be deprecated
  host?: string;
}

export interface ICreateIdentityUiArgs {
  strategy: IdentityStrategy;
  options: CreateIdentityOptions;
  walletType: EWallet;
  messageSignature?: string;
  host?: string;
}
