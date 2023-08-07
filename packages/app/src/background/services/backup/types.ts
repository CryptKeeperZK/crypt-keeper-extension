export interface IBackupable {
  downloadStorage: () => Promise<BackupData | null>;
  restoreStorage: (data: BackupData | null) => Promise<void>;
  downloadEncryptedStorage: (backupPassword: string) => Promise<BackupData | null>;
  uploadEncryptedStorage: (backupEncryptedData: BackupData, backupPassword: string) => Promise<void>;
}

export type BackupData = string | Record<string, string>;
