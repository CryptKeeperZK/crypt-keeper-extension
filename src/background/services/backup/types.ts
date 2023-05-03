export interface IBackupable {
  downloadEncryptedStorage: () => Promise<string | null>;
  uploadEncryptedStorage: (backupEncryptedData: string, backupPassword: string) => Promise<void>;
}
