export enum BackupableServices {
  IDENTITY = "identity",
  APPROVAL = "approval",
  LOCK = "lock",
  WALLET = "wallet",
}

export interface IUploadArgs {
  content: string;
  password: string;
  backupPassword: string;
}
