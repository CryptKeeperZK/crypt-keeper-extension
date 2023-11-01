import {
  PendingRequestType,
  type IConnectionApprovalData,
  type IZkMetadata,
  type ConnectedIdentityMetadata,
} from "@cryptkeeperzk/types";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import LockerService from "@src/background/services/lock";
import ZkIdentityService from "@src/background/services/zkIdentity";

export class InjectorHandler {
  private readonly lockerService: LockerService;

  private readonly approvalService: ApprovalService;

  private readonly browserService: BrowserUtils;

  private readonly requestManager: RequestManager;

  private readonly zkIdentityService: ZkIdentityService;

  constructor() {
    this.approvalService = ApprovalService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.lockerService = LockerService.getInstance();
    this.requestManager = RequestManager.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
  }

  getApprovalService = (): ApprovalService => this.approvalService;

  getZkIdentityService = (): ZkIdentityService => this.zkIdentityService;

  getConnectedIdentityMetadata = async (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata> => {
    const connectedIdentityMetadata = await this.zkIdentityService.getConnectedIdentityData({}, meta);

    if (!connectedIdentityMetadata) {
      throw new Error(`CryptKeeper: identity metadata is not found`);
    }

    return connectedIdentityMetadata;
  };

  newRequest = async (type: PendingRequestType, payload: unknown): Promise<unknown> => {
    const response = await this.requestManager.newRequest(type, payload);
    await this.browserService.closePopup();

    return response;
  };

  checkApproval = async ({ urlOrigin }: IZkMetadata): Promise<IConnectionApprovalData> => {
    await this.checkUnlockStatus();
    const { isApproved, canSkipApprove } = this.getConnectionApprovalData({ urlOrigin });
    return { isApproved, canSkipApprove };
  };

  getConnectionApprovalData = ({ urlOrigin }: IZkMetadata): IConnectionApprovalData => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: Origin is not set");
    }

    const isApproved = this.approvalService.isApproved(urlOrigin);
    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);

    return { isApproved, canSkipApprove };
  };

  private checkUnlockStatus = async () => {
    const { isUnlocked, isInitialized } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();

      if (isInitialized) {
        await this.approvalService.awaitUnlock();
        await this.zkIdentityService.awaitUnlock();
        await this.browserService.closePopup();
      }
    }
  };
}
