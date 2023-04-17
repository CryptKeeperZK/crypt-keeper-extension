import { LockService } from "@src/background/services/lock";
import { SimpleStorageService } from "@src/background/services/storage";

import { HostPermission } from "./Approval.type";

const APPPROVALS_DB_KEY = "@APPROVED@";

export class ApprovalService {
  private allowedHosts: Map<string, HostPermission>;

  private approvals: SimpleStorageService;

  private lockService: LockService;

  public constructor() {
    this.allowedHosts = new Map();
    this.approvals = new SimpleStorageService(APPPROVALS_DB_KEY);
    this.lockService = LockService.getInstance();
  }

  public getAllowedHosts = (): string[] =>
    [...this.allowedHosts.entries()].filter(([, isApproved]) => isApproved).map(([key]) => key);

  public isApproved = (host: string): boolean => this.allowedHosts.has(host);

  public canSkipApprove = (host: string): boolean => Boolean(this.allowedHosts.get(host)?.noApproval);

  public unlock = async (): Promise<boolean> => {
    const encryped = await this.approvals.get<string>();

    if (encryped) {
      const decrypted = this.lockService.decrypt(encryped);
      this.allowedHosts = new Map(JSON.parse(decrypted) as Iterable<[string, HostPermission]>);
    }

    return true;
  };

  public getPermission = (host: string): HostPermission => ({
    noApproval: Boolean(this.allowedHosts.get(host)?.noApproval),
  });

  public setPermission = async (host: string, { noApproval }: HostPermission): Promise<HostPermission> => {
    this.allowedHosts.set(host, { noApproval });
    await this.saveApprovals();

    return { noApproval };
  };

  public add = async ({ host, noApproval }: { host: string; noApproval: boolean }): Promise<void> => {
    if (this.allowedHosts.get(host)) {
      return;
    }

    this.allowedHosts.set(host, { noApproval });
    await this.saveApprovals();
  };

  public remove = async ({ host }: { host: string }): Promise<void> => {
    if (!this.allowedHosts.has(host)) {
      return;
    }

    this.allowedHosts.delete(host);
    await this.saveApprovals();
  };

  /** dev only */
  public clear = async (): Promise<void> => {
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
}
