import { setApproval } from "@src/ui/ducks";
import pushMessage from "@src/util/pushMessage";

import LockService from "./lock";
import pushMessage from "@src/util/pushMessage";
import { setApproval } from "@src/ui/ducks";
import SimpleStorage from "./simpleStorage";

const APPPROVALS_DB_KEY = "@APPROVED@";

interface HostPermission {
  noApproval: boolean;
}

export default class ApprovalService {
  private allowedHosts: Map<string, HostPermission>;

  private approvals: SimpleStorage;

  private lockService: LockService;

  constructor() {
    this.allowedHosts = new Map();
    this.approvals = new SimpleStorage(APPPROVALS_DB_KEY);
    this.lockService = LockService.getInstance();
  }

  public getAllowedHosts = (): string[] =>
    [...this.allowedHosts.entries()].filter(([, isApproved]) => isApproved).map(([key]) => key);

  public isApproved = (host: string): boolean => {
    pushMessage(
      setApproval({
        host,
        noApproval: this.allowedHosts.has(host),
      }),
    );

    return this.allowedHosts.has(host);
  };

  public canSkipApprove = (host: string): boolean => Boolean(this.allowedHosts.get(host)?.noApproval);

  public unlock = async (): Promise<boolean> => {
    const encryped = await this.approvals.get<string>();

    if (encryped) {
      const decrypted = this.lockService.decrypt(encryped);
      this.allowedHosts = new Map(JSON.parse(decrypted) as Iterable<[string, HostPermission]>);
    }

    return true;
  };

  public getPermission = (host: string): HostPermission => {
    const noApproval = {
      host,
      noApproval: Boolean(this.allowedHosts.get(host)?.noApproval),
    };

    pushMessage(setApproval(noApproval));

    return noApproval;
  };

  public setPermission = async (host: string, { noApproval }: HostPermission): Promise<{
    host: string;
    noApproval: boolean;
  }> => {
    this.allowedHosts.set(host, { noApproval });
    await this.saveApprovals();

    pushMessage(
      setApproval({
        host,
        noApproval,
      }),
    );

    return {
      host,
      noApproval,
    }
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
    const newApprovals = this.lockService.encrypt(JSON.stringify(this.allowedHosts));
    await this.approvals.set(newApprovals);
  }
}
