import CryptoService, { ECryptMode } from "@src/background/services/crypto";
import SimpleStorage from "@src/background/services/storage";

import type { IHostPermission } from "@cryptkeeperzk/types";
import type { BackupData, IBackupable } from "@src/background/services/backup";

const APPROVALS_DB_KEY = "@APPROVED@";

export default class ApprovalService implements IBackupable {
  private static INSTANCE?: ApprovalService;

  private allowedHosts: Map<string, IHostPermission>;

  private approvals: SimpleStorage;

  private cryptoService: CryptoService;

  private constructor() {
    this.allowedHosts = new Map();
    this.approvals = new SimpleStorage(APPROVALS_DB_KEY);
    this.cryptoService = CryptoService.getInstance();
  }

  static getInstance = (): ApprovalService => {
    if (!ApprovalService.INSTANCE) {
      ApprovalService.INSTANCE = new ApprovalService();
    }

    return ApprovalService.INSTANCE;
  };

  getAllowedHosts = (): string[] =>
    [...this.allowedHosts.entries()].filter(([, { canSkipApprove }]) => canSkipApprove).map(([key]) => key);

  isApproved = (host: string): boolean => this.allowedHosts.has(host);

  canSkipApprove = (host: string): boolean => Boolean(this.allowedHosts.get(host)?.canSkipApprove);

  unlock = async (): Promise<boolean> => {
    const encryped = await this.approvals.get<string>();

    if (encryped) {
      const decrypted = this.cryptoService.decrypt(encryped, { mode: ECryptMode.MNEMONIC });
      this.allowedHosts = new Map(JSON.parse(decrypted) as Iterable<[string, IHostPermission]>);
    }

    return true;
  };

  getPermission = (host: string): IHostPermission => ({
    host,
    canSkipApprove: Boolean(this.allowedHosts.get(host)?.canSkipApprove),
  });

  setPermission = async ({ host, canSkipApprove }: IHostPermission): Promise<IHostPermission> => {
    this.allowedHosts.set(host, { host, canSkipApprove });
    await this.saveApprovals();

    return { host, canSkipApprove };
  };

  add = async ({ host, canSkipApprove }: IHostPermission): Promise<void> => {
    if (this.allowedHosts.get(host)) {
      return;
    }

    this.allowedHosts.set(host, { host, canSkipApprove });
    await this.saveApprovals();
  };

  remove = async ({ host }: { host: string }): Promise<void> => {
    if (!this.allowedHosts.has(host)) {
      return;
    }

    this.allowedHosts.delete(host);
    await this.saveApprovals();
  };

  /** dev only */
  clear = async (): Promise<void> => {
    if (!["development", "test"].includes(process.env.NODE_ENV!)) {
      return;
    }

    this.allowedHosts.clear();
    await this.approvals.clear();
  };

  private async saveApprovals(): Promise<void> {
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

    await this.saveApprovals();
  };
}
