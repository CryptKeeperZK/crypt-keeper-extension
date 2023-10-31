import {
  PendingRequestType,
  type IConnectionData,
  type IZkMetadata,
  type ConnectedIdentityMetadata,
} from "@cryptkeeperzk/types";
import pick from "lodash/pick";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import ConnectionService from "@src/background/services/connection";
import LockerService from "@src/background/services/lock";
import ZkIdentityService from "@src/background/services/zkIdentity";

export class InjectorHandler {
  private readonly lockerService: LockerService;

  private readonly approvalService: ApprovalService;

  private readonly browserService: BrowserUtils;

  private readonly requestManager: RequestManager;

  private readonly connectionService: ConnectionService;

  private readonly zkIdentityService: ZkIdentityService;

  constructor() {
    this.approvalService = ApprovalService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.lockerService = LockerService.getInstance();
    this.requestManager = RequestManager.getInstance();
    this.connectionService = ConnectionService.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
  }

  getApprovalService = (): ApprovalService => this.approvalService;

  getConnectionService = (): ConnectionService => this.connectionService;

  getConnectedIdentityMetadata = (_: unknown, meta: IZkMetadata): ConnectedIdentityMetadata | undefined => {
    const connectedIdentity = this.connectionService.getConnectedIdentity(meta.urlOrigin!);

    return pick(connectedIdentity?.metadata, ["name"]) as ConnectedIdentityMetadata | undefined;
  };

  newRequest = async (type: PendingRequestType, payload: unknown): Promise<unknown> => {
    const response = await this.requestManager.newRequest(type, payload);
    await this.browserService.closePopup();

    return response;
  };

  checkApproval = async ({ urlOrigin }: IZkMetadata): Promise<IConnectionData> => {
    await this.checkUnlockStatus();

    return this.getConnectionData({ urlOrigin });
  };

  getConnectionData = ({ urlOrigin }: IZkMetadata): IConnectionData => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: Origin is not set");
    }

    const isApproved = this.approvalService.isApproved(urlOrigin);
    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);
    const identity = this.connectionService.getConnectedIdentity(urlOrigin);

    return { isApproved, isConnected: Boolean(identity), canSkipApprove };
  };

  private checkUnlockStatus = async () => {
    const { isUnlocked, isInitialized } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();

      if (isInitialized) {
        await this.approvalService.awaitUnlock();
        await this.zkIdentityService.awaitUnlock();
        await this.connectionService.awaitUnlock();
        await this.browserService.closePopup();
      }
    }
  };
}
