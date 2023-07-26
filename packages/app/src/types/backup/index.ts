export enum BackupableServices {
  IDENTITY = "identity",
  APPROVAL = "approval",
  LOCK = "lock",
  WALLET = "wallet",
  VERIFIABLE_CREDENTIALS = "verifiable credentials",
}

export interface IUploadArgs {
  content: string;
  password: string;
  backupPassword: string;
}
