import log from "loglevel";

import SimpleStorage from "./simpleStorage";
import LockService from "./lock";

const DB_KEY = "@APPROVED@";

export default class ApprovalService extends SimpleStorage {
  private allowedHosts: string[];

  permissions: SimpleStorage;

  constructor() {
    super(DB_KEY);
    this.allowedHosts = [];
    this.permissions = new SimpleStorage("@HOST_PERMISSIONS@");
  }

  getAllowedHosts = () => this.allowedHosts;

  isApproved = (origin: string): boolean => this.allowedHosts.includes(origin);

  unlock = async (): Promise<boolean> => {
    const encrypedArray = await this.get<string[]>();

    if (!encrypedArray) return true;

    this.allowedHosts = await Promise.all(encrypedArray.map((cipertext: string) => LockService.decrypt(cipertext)));

    return true;
  };

  refresh = async () => {
    const encrypedArray = await this.get<string[]>();

    if (!encrypedArray) {
      this.allowedHosts = [];
      return;
    }

    this.allowedHosts = await Promise.all(encrypedArray.map((cipertext: string) => LockService.decrypt(cipertext)));
  };

  getPermission = async (host: string) => {
    const store = await this.permissions.get<Record<string, { noApproval: boolean }>>();
    const permission = store?.[host];

    return {
      noApproval: Boolean(permission?.noApproval),
    };
  };

  setPermission = async (
    host: string,
    permission: {
      noApproval: boolean;
    },
  ) => {
    const { noApproval } = permission;
    const existing = await this.getPermission(host);
    const newPer = {
      ...existing,
      noApproval,
    };

    const store = await this.permissions.get();
    await this.permissions.set({
      ...(store || {}),
      [host]: newPer,
    });
    return newPer;
  };

  add = async (payload: { host: string; noApproval?: boolean }) => {
    const { host } = payload;

    if (!host) throw new Error("No host provided");

    if (this.allowedHosts.includes(host)) return;

    this.allowedHosts.push(host);

    const promises: Array<Promise<string>> = this.allowedHosts.map((allowedHost: string) =>
      LockService.encrypt(allowedHost),
    );

    const newValue: Array<string> = await Promise.all(promises);

    await this.set(newValue);
    await this.refresh();
  };

  remove = async (payload: any) => {
    const { host }: { host: string } = payload;
    log.debug(payload);
    if (!host) throw new Error("No address provided");

    const index: number = this.allowedHosts.indexOf(host);
    if (index === -1) return;

    this.allowedHosts = [...this.allowedHosts.slice(0, index), ...this.allowedHosts.slice(index + 1)];

    const promises: Array<Promise<string>> = this.allowedHosts.map((allowedHost: string) =>
      LockService.encrypt(allowedHost),
    );

    const newValue: Array<string> = await Promise.all(promises);
    await this.set(newValue);
    await this.refresh();
  };

  /** dev only */
  empty = async (): Promise<any> => {
    if (!(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")) return;
    await this.clear();
    await this.refresh();
  };
}
