import { EventName } from "@cryptkeeperzk/providers";

import BrowserUtils from "@src/background/controllers/browserUtils";
import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import SimpleStorage from "@src/background/services/storage";

import type { IHostPermission, IZkMetadata } from "@cryptkeeperzk/types";
import type { BackupData, IBackupable } from "@src/background/services/backup";

import BaseService from "../base";

const APPROVALS_DB_KEY = "@APPROVED@";

export default class ApprovalService extends BaseService implements IBackupable {
  private static INSTANCE?: ApprovalService;

  private allowedHosts: Map<string, IHostPermission>;

  private browserController: BrowserUtils;

  private approvals: SimpleStorage;

  private cryptoService: CryptoService;

  private constructor() {
    super();
    this.allowedHosts = new Map();
    this.approvals = new SimpleStorage(APPROVALS_DB_KEY);
    this.cryptoService = CryptoService.getInstance();
    this.browserController = BrowserUtils.getInstance();
  }

  static getInstance = (): ApprovalService => {
    if (!ApprovalService.INSTANCE) {
      ApprovalService.INSTANCE = new ApprovalService();
    }

    return ApprovalService.INSTANCE;
  };

  getAllowedHosts = (): string[] =>
    [...this.allowedHosts.entries()].filter(([, { canSkipApprove }]) => canSkipApprove).map(([key]) => key);

  isApproved = (urlOrigin: string): boolean => this.allowedHosts.has(urlOrigin);

  canSkipApprove = (urlOrigin: string): boolean => Boolean(this.allowedHosts.get(urlOrigin)?.canSkipApprove);

  isOriginApproved = (payload: unknown, { urlOrigin }: IZkMetadata): unknown => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: origin is not set");
    }

    const isApproved = this.isApproved(urlOrigin);

    if (!isApproved) {
      throw new Error("CryptKeeper: origin is not approved");
    }

    return payload;
  };

  unlock = async (): Promise<boolean> => {
    const encryped = await this.approvals.get<string>();

    if (encryped) {
      const decrypted = this.cryptoService.decrypt(encryped, { mode: ECryptMode.MNEMONIC });
      this.allowedHosts = new Map(JSON.parse(decrypted) as Iterable<[string, IHostPermission]>);
    }

    this.isUnlocked = true;
    this.onUnlocked();

    return true;
  };

  lock = async (): Promise<boolean> => this.onLock(this.onClean);

  private onClean = (): boolean => {
    this.allowedHosts.clear();

    return true;
  };

  getPermission = (urlOrigin: string): IHostPermission => ({
    urlOrigin,
    canSkipApprove: Boolean(this.allowedHosts.get(urlOrigin)?.canSkipApprove),
  });

  setPermission = async ({ urlOrigin, canSkipApprove }: IHostPermission): Promise<IHostPermission> => {
    this.allowedHosts.set(urlOrigin, { urlOrigin, canSkipApprove });
    await this.save();

    return { urlOrigin, canSkipApprove };
  };

  add = async ({ urlOrigin, canSkipApprove }: IHostPermission): Promise<void> => {
    if (this.allowedHosts.get(urlOrigin)) {
      return;
    }

    this.allowedHosts.set(urlOrigin, { urlOrigin, canSkipApprove });
    await this.save();

    await this.browserController
      .pushEvent({ type: EventName.APPROVAL, payload: { isApproved: true, urlOrigin } }, { urlOrigin })
      .then(() => this.browserController.closePopup());
  };

  remove = async ({ urlOrigin }: { urlOrigin: string }): Promise<void> => {
    if (!this.allowedHosts.has(urlOrigin)) {
      return;
    }

    this.allowedHosts.delete(urlOrigin);
    await this.save();

    await this.browserController
      .pushEvent({ type: EventName.APPROVAL, payload: { isApproved: false, urlOrigin } }, { urlOrigin })
      .then(() => this.browserController.closePopup());
  };

  /** dev only */
  clear = async (): Promise<void> => {
    if (!["development", "test"].includes(process.env.NODE_ENV!)) {
      return;
    }

    this.allowedHosts.clear();
    await this.approvals.clear();
  };

  private async save(): Promise<void> {
    const serializedApprovals = JSON.stringify(Array.from(this.allowedHosts.entries()));
    const newApprovals = this.cryptoService.encrypt(serializedApprovals, { mode: ECryptMode.MNEMONIC });
    await this.approvals.set(newApprovals);
  }

  downloadStorage = (): Promise<string | null> => this.approvals.get<string>();

  restoreStorage = async (data: BackupData | null): Promise<void> => {
    if (data && typeof data !== "string") {
      throw new Error("Incorrect restore format for approvals");
    }

    await this.approvals.set(data);
  };

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const data = await this.approvals.get<string>();

    if (!data) {
      return null;
    }

    const backup = this.cryptoService.decrypt(data, { mode: ECryptMode.MNEMONIC });
    const encryptedBackup = this.cryptoService.encrypt(backup, { secret: backupPassword });

    return this.cryptoService.generateEncryptedHmac(encryptedBackup, backupPassword);
  };

  uploadEncryptedStorage = async (
    backupEncryptedData: string | Record<string, string>,
    backupPassword: string,
  ): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    const encryptedBackup = this.cryptoService.getAuthenticBackup(backupEncryptedData, backupPassword);

    if (typeof encryptedBackup !== "string") {
      throw new Error("Incorrect backup format for approvals");
    }

    const backup = this.cryptoService.decrypt(encryptedBackup, { secret: backupPassword });
    await this.unlock();

    const backupAllowedHosts = new Map(JSON.parse(backup) as Iterable<[string, IHostPermission]>);
    this.allowedHosts = new Map([...this.allowedHosts, ...backupAllowedHosts]);

    await this.save();
  };
}
