export interface IBackupable {
  downloadEncryptedStorage: (backupPassword: string) => Promise<string | Record<string, string> | null>;
  uploadEncryptedStorage: (
    backupEncryptedData: string | Record<string, string>,
    backupPassword: string,
  ) => Promise<void>;
}
