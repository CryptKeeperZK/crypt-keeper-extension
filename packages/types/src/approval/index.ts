export interface IConnectionApprovalData {
  checkedUrlOrigin: string;
  isApproved: boolean;
  canSkipApprove: boolean;
}

export interface IConnectionOptions {
  isChangeIdentity?: boolean;
}
