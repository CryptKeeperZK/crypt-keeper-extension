import {
  PendingRequestType,
  type IZkMetadata,
  type ConnectedIdentityMetadata,
  type IHostPermission,
  type IConnectionOptions,
  type IConnectionData,
} from "@cryptkeeperzk/types";
import pick from "lodash/pick";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import ConnectionService from "@src/background/services/connection";
import LockerService from "@src/background/services/lock";
import ZkIdentityService from "@src/background/services/zkIdentity";

export class InjectorService {
  private static INSTANCE?: InjectorService;

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

  static getInstance(): InjectorService {
    if (!InjectorService.INSTANCE) {
      InjectorService.INSTANCE = new InjectorService();
    }

    return InjectorService.INSTANCE;
  }

  connect = async ({ isChangeIdentity }: IConnectionOptions, { urlOrigin }: IZkMetadata): Promise<void> => {
    await this.checkUnlockStatus();

    try {
      const { isApproved, canSkipApprove, isConnected } = this.getConnectionData({ urlOrigin });

      if (!isApproved) {
        const { canSkipApprove: skipApprove } = await this.newRequest<IHostPermission>(PendingRequestType.APPROVE, {
          urlOrigin,
        });
        await this.approvalService.add({ urlOrigin: urlOrigin!, canSkipApprove: skipApprove });
      } else {
        await this.approvalService.add({ urlOrigin: urlOrigin!, canSkipApprove });
      }

      if (!isConnected || isChangeIdentity) {
        await this.connectionService.connectRequest({}, { urlOrigin: urlOrigin! });
      }
    } catch (error) {
      throw new Error(`CryptKeeper: error in the connect request, ${(error as Error).message}`);
    }
  };

  getConnectedIdentityMetadata = (_: unknown, { urlOrigin }: IZkMetadata): ConnectedIdentityMetadata | undefined => {
    const { isApproved, isConnected } = this.getConnectionData({ urlOrigin });

    if (!isApproved || !isConnected) {
      return undefined;
    }

    const connectedIdentity = this.connectionService.getConnectedIdentity(urlOrigin!);
    return pick(connectedIdentity?.metadata, ["name"]) as ConnectedIdentityMetadata | undefined;
  };

  private newRequest = async <T>(type: PendingRequestType, payload: unknown): Promise<T> => {
    const response = await this.requestManager.newRequest(type, payload);
    await this.browserService.closePopup();

    return response as T;
  };

  private getConnectionData = ({ urlOrigin }: IZkMetadata): IConnectionData => {
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
