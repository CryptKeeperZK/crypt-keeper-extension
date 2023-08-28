import type { ICreateIdentityOptions, EWallet, IGroupData, IdentityStrategy } from "../identity";

export interface ICreateIdentityUiArgs {
  strategy: IdentityStrategy;
  options: ICreateIdentityOptions;
  walletType: EWallet;
  groups: IGroupData[];
  messageSignature?: string;
  host?: string;
}
