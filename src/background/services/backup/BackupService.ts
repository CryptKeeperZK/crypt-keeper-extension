import { browser } from "webextension-polyfill-ts";

import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import { OperationType, type IUploadArgs } from "@src/types";

import { type IBackupable } from "./types";

export default class BackupService {
  private static INSTANCE: BackupService;

  private backupables: Map<string, IBackupable>;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private constructor() {
    this.backupables = new Map();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance = (): BackupService => {
    if (!BackupService.INSTANCE) {
      BackupService.INSTANCE = new BackupService();
    }

    return BackupService.INSTANCE;
  };

  download = async (backupPassword: string): Promise<string> => {
    const keys = [...this.backupables.keys()];
    const services = [...this.backupables.values()];

    const data = await Promise.all(services.map((service) => service.downloadEncryptedStorage(backupPassword)));
    const prepared = data.reduce<Record<string, string | null>>((acc, x, index) => ({ ...acc, [keys[index]]: x }), {});

    await this.historyService.trackOperation(OperationType.DOWNLOAD_BACKUP, {});
    await this.notificationService.create({
      options: {
        title: "Backup download",
        message: "Backup data has been successfully downloaded",
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(prepared, null, 4))}`;
  };

  upload = async ({ content, password }: IUploadArgs): Promise<boolean> => {
    const data = JSON.parse(content) as Record<string, string | null>;
    const entries = Object.entries(data).filter(([key]) => this.backupables.has(key));
    const isEmpty = entries.every(([, value]) => !value);

    if (entries.length === 0) {
      throw new Error("File content is corrupted");
    }

    if (isEmpty) {
      throw new Error("File doesn't have any data");
    }

    await Promise.all(
      entries.map(([key, value]) => value && this.backupables.get(key)?.uploadEncryptedStorage(value, password)),
    );

    await this.historyService.trackOperation(OperationType.UPLOAD_BACKUP, {});
    await this.notificationService.create({
      options: {
        title: "Backup upload",
        message: "Backup data has been successfully uploaded",
        iconUrl: browser.runtime.getURL("/logo.png"),
        type: "basic",
      },
    });

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
