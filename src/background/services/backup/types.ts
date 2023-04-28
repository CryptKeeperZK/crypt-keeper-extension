export interface IBackupable {
  downloadEncryptedStorage: () => Promise<string | null>;
  uploadEncryptedStorage: (encrypted: string, password: string) => Promise<void>;
}
