import SimpleStorage from "./simpleStorage";
import LockService from "./lock";

const APPPROVALS_DB_KEY = "@APPROVED@";

interface HostPermission {
  noApproval: boolean;
}

export default class ApprovalService {
  private allowedHosts: Map<string, { noApproval: boolean }>;
  private approvals: SimpleStorage;

  constructor() {
    this.allowedHosts = new Map();
    this.approvals = new SimpleStorage(APPPROVALS_DB_KEY);
  }

  public getAllowedHosts = (): string[] =>
    [...this.allowedHosts.entries()].filter(([, isApproved]) => isApproved).map(([key]) => key);

  public isApproved = (origin: string): boolean => this.allowedHosts.has(origin);

  public canSkipApprove = (origin: string): boolean => Boolean(this.allowedHosts.get(origin)?.noApproval);

  public unlock = async (): Promise<boolean> => {
    const encryped = await this.approvals.get<string>();

    if (encryped) {
      const decrypted = await LockService.decrypt(encryped);
      this.allowedHosts = new Map(JSON.parse(decrypted));
    }

    return true;
  };

  public getPermission = async (host: string): Promise<HostPermission> => {
    return {
      noApproval: Boolean(this.allowedHosts.get(host)?.noApproval),
    };
  };

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
    const newApprovals = await LockService.encrypt(JSON.stringify(this.allowedHosts));
    await this.approvals.set(newApprovals);
  }
}
