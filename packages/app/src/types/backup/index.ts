export enum BackupableServices {
  LOCK = "lock",
  WALLET = "wallet",
  APPROVAL = "approval",
  IDENTITY = "identity",
  VERIFIABLE_CREDENTIALS = "credentials",
  CONNECTIONS = "connections",
}

export interface IUploadArgs {
  content: string;
  password: string;
  backupPassword: string;
}
