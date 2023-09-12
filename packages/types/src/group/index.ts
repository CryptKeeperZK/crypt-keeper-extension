import type { IIdentityData } from "../identity";

export interface IGenerateGroupMerkleProofArgs {
  groupId: string;
}

export interface IGenerateBandadaMerkleProofArgs extends IGenerateGroupMerkleProofArgs {
  identity: IIdentityData;
}

export interface IJoinGroupMemberArgs {
  groupId: string;
  apiKey?: string;
  inviteCode?: string;
}

export interface IAddBandadaGroupMemberArgs extends IJoinGroupMemberArgs {
  identity: IIdentityData;
}
