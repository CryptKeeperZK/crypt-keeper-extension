import type { ICreateIdentityOptions, EWallet, IGroupData } from "../identity";

export interface ICreateIdentityUiArgs {
  options: ICreateIdentityOptions;
  walletType: EWallet;
  isDeterministic: boolean;
  groups: IGroupData[];
  messageSignature?: string;
  host?: string;
}
