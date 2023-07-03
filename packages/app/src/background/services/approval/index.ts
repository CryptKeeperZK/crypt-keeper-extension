import CryptoService from "@src/background/services/crypto";
import LockerService from "@src/background/services/lock";
import SimpleStorage from "@src/background/services/storage";

import type { HostPermission } from "@cryptkeeperzk/types";
import type { IBackupable } from "@src/background/services/backup";

const APPPROVALS_DB_KEY = "@APPROVED@";

export default class ApprovalService implements IBackupable {
  private static INSTANCE: ApprovalService;

  private allowedHosts: Map<string, HostPermission>;

  private approvals: SimpleStorage;

  private lockService: LockerService;

  private cryptoService: CryptoService;

  private constructor() {
    this.allowedHosts = new Map();
    this.approvals = new SimpleStorage(APPPROVALS_DB_KEY);
    this.lockService = LockerService.getInstance();
    this.cryptoService = new CryptoService();
  }

  static getInstance = (): ApprovalService => {
    if (!ApprovalService.INSTANCE) {
      ApprovalService.INSTANCE = new ApprovalService();
    }

    return ApprovalService.INSTANCE;
  };

  getAllowedHosts = (): string[] =>
    [...this.allowedHosts.entries()].filter(([, isApproved]) => isApproved).map(([key]) => key);

  isApproved = (host: string): boolean => this.allowedHosts.has(host);

  canSkipApprove = (host: string): boolean => Boolean(this.allowedHosts.get(host)?.canSkipApprove);

  unlock = async (): Promise<boolean> => {
    const encryped = await this.approvals.get<string>();

    if (encryped) {
      const decrypted = this.lockService.decrypt(encryped);
      this.allowedHosts = new Map(JSON.parse(decrypted) as Iterable<[string, HostPermission]>);
    }

    return true;
  };

  getPermission = (host: string): HostPermission => ({
    host,
    canSkipApprove: Boolean(this.allowedHosts.get(host)?.canSkipApprove),
  });

  setPermission = async ({ host, canSkipApprove }: HostPermission): Promise<HostPermission> => {
    this.allowedHosts.set(host, { host, canSkipApprove });
    await this.saveApprovals();

    return { host, canSkipApprove };
  };

  add = async ({ host, canSkipApprove }: HostPermission): Promise<void> => {
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
    if (!["development", "test"].includes(process.env.NODE_ENV as string)) {
      return;
    }

    this.allowedHosts.clear();
    await this.approvals.clear();
  };

  private async saveApprovals(): Promise<void> {
    const serializedApprovals = JSON.stringify(Array.from(this.allowedHosts.entries()));
    const newApprovals = this.lockService.encrypt(serializedApprovals);
    await this.approvals.set(newApprovals);
  }

  downloadEncryptedStorage = async (backupPassword: string): Promise<string | null> => {
    const backupEncryptedData = await this.approvals.get<string>();

    if (!backupEncryptedData) {
      return null;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    return this.cryptoService.generateEncryptedHmac(backupEncryptedData, backupPassword);
  };

  uploadEncryptedStorage = async (backupEncryptedData: string, backupPassword: string): Promise<void> => {
    if (!backupEncryptedData) {
      return;
    }

    await this.lockService.isAuthentic(backupPassword, true);
    await this.approvals.set<string>(this.cryptoService.getAuthenticCiphertext(backupEncryptedData, backupPassword));
  };
}
