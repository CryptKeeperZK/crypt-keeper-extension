import type { CreateIdentityOptions, EWallet, GroupData, IdentityStrategy } from "../identity";

export interface ICreateIdentityUiArgs {
  strategy: IdentityStrategy;
  options: CreateIdentityOptions;
  walletType: EWallet;
  groups: GroupData[];
  messageSignature?: string;
  host?: string;
}
