export interface IBackupable {
  downloadEncryptedStorage: (backupPassword: string) => Promise<string | null>;
  uploadEncryptedStorage: (backupEncryptedData: string, backupPassword: string) => Promise<void>;
}
