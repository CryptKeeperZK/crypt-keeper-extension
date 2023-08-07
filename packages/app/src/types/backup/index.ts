export enum BackupableServices {
  LOCK = "lock",
  WALLET = "wallet",
  APPROVAL = "approval",
  IDENTITY = "identity",
  VERIFIABLE_CREDENTIALS = "credentials",
}

export interface IUploadArgs {
  content: string;
  password: string;
  backupPassword: string;
}
