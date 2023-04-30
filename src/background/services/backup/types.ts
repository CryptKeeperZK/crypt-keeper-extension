export interface IBackupable {
  downloadDecryptedStorage: () => Promise<string | null>;
  uploadDecryptedStorage: (encrypted: string) => Promise<void>;
}
