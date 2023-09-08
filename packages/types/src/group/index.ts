export interface IGenerateBandadaMerkleProofArgs {
  groupId: string;
  commitment: string;
}

export interface IAddBandadaGroupMemberArgs {
  groupId: string;
  commitment: string;
  apiKey?: string;
  inviteCode?: string;
}
