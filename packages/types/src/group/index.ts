export interface IGenerateGroupMerkleProofArgs {
  groupId: string;
}

export interface IGenerateBandadaMerkleProofArgs extends IGenerateGroupMerkleProofArgs {
  commitment: string;
}

export interface IJoinGroupMemberArgs {
  groupId: string;
  apiKey?: string;
  inviteCode?: string;
}

export interface IAddBandadaGroupMemberArgs extends IJoinGroupMemberArgs {
  commitment: string;
}
