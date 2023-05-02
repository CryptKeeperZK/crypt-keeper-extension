import { type IUploadArgs } from "@src/types";
import SimpleStorage from "@src/background/services//storage";
import {
  isHmacAuthentic,
  cryptoDecrypt,
  cryptoEncrypt,
  generateEncryptedHmac,
  subHmacCiphertext,
} from "@src/background/services/crypto";

import { type IBackupable } from "./types";

const PASSWORD_DB_KEY = "@backup-password@";

export default class BackupService {
  private static INSTANCE: BackupService;

  private backupables: Map<string, IBackupable>;

  private password?: string;

  private passwordChecker: string;

  private passwordStorage: SimpleStorage;

  private constructor() {
    this.backupables = new Map();
    this.passwordChecker = "Backup password is correct";
    this.passwordStorage = new SimpleStorage(PASSWORD_DB_KEY);
  }

  static getInstance = (): BackupService => {
    if (!BackupService.INSTANCE) {
      BackupService.INSTANCE = new BackupService();
    }

    return BackupService.INSTANCE;
  };

  setupPassword = async (password: string): Promise<void> => {
    const cipherText = cryptoEncrypt(this.passwordChecker, password);
    this.password = password;
    await this.passwordStorage.set(cipherText);
  };

  download = async (): Promise<string> => {
    const keys = [...this.backupables.keys()];
    const services = [...this.backupables.values()];

    const data = await Promise.all(
      services.map(async (service) => {
        const serviceDecryptedData = await service.downloadDecryptedStorage();
        if (!serviceDecryptedData || !this.password) return null;
        const cipherText = cryptoEncrypt(serviceDecryptedData, this.password);
        return generateEncryptedHmac(cipherText, this.password);
      }),
    );
    const prepared = data.reduce<Record<string, string | null>>((acc, x, index) => ({ ...acc, [keys[index]]: x }), {});

    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(prepared, null, 4))}`;
  };

  upload = async ({ content }: IUploadArgs): Promise<boolean> => {
    const data = JSON.parse(content) as Record<string, string | null>;
    const entries = Object.entries(data).filter(([key]) => this.backupables.has(key));

    if (entries.length === 0) {
      throw new Error("File content is corrupted");
    }

    await Promise.all(
      entries.map(([key, ciphertext]) => {
        if (ciphertext && this.backupables.get(key) && this.password) {
          const isAuthentic = isHmacAuthentic(ciphertext, this.password);
          if (!isAuthentic) throw new Error("This backup file is not authentic.");
          else {
            const { transitCipherContent } = subHmacCiphertext(ciphertext);
            const encryptedContent = cryptoDecrypt(transitCipherContent, this.password);
            const service = this.backupables.get(key);
            service?.uploadDecryptedStorage(encryptedContent);
          }
        }
      }),
    );

    return true;
  };

  getBackupables = (): Map<string, IBackupable> => this.backupables;

  add = (key: string, backupable: IBackupable): BackupService => {
    this.backupables.set(key, backupable);
    return this;
  };

  remove = (key: string): BackupService => {
    this.backupables.delete(key);
    return this;
  };

  clear = (): BackupService => {
    this.backupables.clear();
    return this;
  };
}
