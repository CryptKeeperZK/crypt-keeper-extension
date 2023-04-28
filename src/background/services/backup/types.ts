export interface IBackupable {
  downloadEncryptedStorage: () => Promise<string | null>;
  uploadEncryptedStorage: (encrypted: string) => Promise<void>;
}
