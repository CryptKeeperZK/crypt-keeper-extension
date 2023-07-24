import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService from "@src/background/services/crypto";
import HistoryService from "@src/background/services/history";
import NotificationService from "@src/background/services/notification";
import { Paths } from "@src/constants";
import { OperationType, type IUploadArgs } from "@src/types";

import { type IBackupable } from "./types";

export default class BackupService {
  private static INSTANCE: BackupService;

  private backupables: Map<string, IBackupable>;

  private historyService: HistoryService;

  private notificationService: NotificationService;

  private cryptoService: CryptoService;

  private browserController: BrowserUtils;

  private constructor() {
    this.backupables = new Map();
    this.historyService = HistoryService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.cryptoService = CryptoService.getInstance();
    this.browserController = BrowserUtils.getInstance();
  }

  static getInstance = (): BackupService => {
    if (!BackupService.INSTANCE) {
      BackupService.INSTANCE = new BackupService();
    }

    return BackupService.INSTANCE;
  };

  createUploadBackupRequest = async (): Promise<void> => {
    await this.browserController.openPopup({ params: { redirect: Paths.UPLOAD_BACKUP } });
  };

  download = async (backupPassword: string): Promise<string> => {
    this.cryptoService.isAuthenticPassword(backupPassword);

    const keys = [...this.backupables.keys()];
    const services = [...this.backupables.values()];

    const data = await Promise.all(services.map((service) => service.downloadEncryptedStorage(backupPassword)));
    const prepared = data.reduce<Record<string, string | Record<string, string> | null>>(
      (acc, x, index) => ({ ...acc, [keys[index]]: x }),
      {},
    );

    await this.historyService.trackOperation(OperationType.DOWNLOAD_BACKUP, {});
    await this.notificationService.create({
      options: {
        title: "Backup download",
        message: "Backup data has been successfully downloaded",
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
        type: "basic",
      },
    });

    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(prepared, null, 4))}`;
  };

  upload = async ({ content, password, backupPassword }: IUploadArgs): Promise<boolean> => {
    this.cryptoService.isAuthenticPassword(password);

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
      entries.map(([key, value]) => value && this.backupables.get(key)?.uploadEncryptedStorage(value, backupPassword)),
    );

    await this.historyService.trackOperation(OperationType.UPLOAD_BACKUP, {});
    await this.notificationService.create({
      options: {
        title: "Backup upload",
        message: "Backup data has been successfully uploaded",
        iconUrl: browser.runtime.getURL("/icons/logo.png"),
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
