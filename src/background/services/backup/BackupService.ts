import { type IUploadArgs } from "@src/types";

import { type IBackupable } from "./types";

export default class BackupService {
  private static INSTANCE: BackupService;

  private backupables: Map<string, IBackupable>;

  private constructor() {
    this.backupables = new Map();
  }

  static getInstance = (): BackupService => {
    if (!BackupService.INSTANCE) {
      BackupService.INSTANCE = new BackupService();
    }

    return BackupService.INSTANCE;
  };

  // TODO: support password check
  download = async (): Promise<string> => {
    const keys = [...this.backupables.keys()];
    const services = [...this.backupables.values()];

    const data = await Promise.all(services.map((service) => service.downloadEncryptedStorage()));
    const prepared = data.reduce<Record<string, string | null>>((acc, x, index) => ({ ...acc, [keys[index]]: x }), {});

    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(prepared, null, 4))}`;
  };

  upload = async ({ content, password }: IUploadArgs): Promise<boolean> => {
    const data = JSON.parse(content) as Record<string, string | null>;
    const entries = Object.entries(data).filter(([key]) => this.backupables.has(key));

    if (entries.length === 0) {
      throw new Error("File content is corrupted");
    }

    await Promise.all(
      entries.map(([key, value]) => value && this.backupables.get(key)?.uploadEncryptedStorage(value, password)),
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
