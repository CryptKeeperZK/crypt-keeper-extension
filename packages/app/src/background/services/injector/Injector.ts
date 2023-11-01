import {
  PendingRequestType,
  type IZkMetadata,
  type ConnectedIdentityMetadata,
  type IHostPermission,
  type IConnectionOptions,
} from "@cryptkeeperzk/types";

import { InjectorHandler } from "./InjectorHandler";

export class InjectorService {
  private static INSTANCE?: InjectorService;

  private injectorHandler: InjectorHandler;

  private constructor() {
    this.injectorHandler = new InjectorHandler();
  }

  static getInstance(): InjectorService {
    if (!InjectorService.INSTANCE) {
      InjectorService.INSTANCE = new InjectorService();
    }

    return InjectorService.INSTANCE;
  }

  isConnected = async (payload: unknown, { urlOrigin }: IZkMetadata): Promise<unknown> => {
    await this.injectorHandler.getConnectedIdentityMetadata({}, { urlOrigin });

    return payload;
  };

  getConnectedIdentityMetadata = async (
    _: unknown,
    { urlOrigin }: IZkMetadata,
  ): Promise<ConnectedIdentityMetadata | undefined> => {
    const { isApproved } = this.injectorHandler.getConnectionApprovalData({ urlOrigin });

    if (!isApproved) {
      return undefined;
    }

    return this.injectorHandler.getConnectedIdentityMetadata({}, { urlOrigin });
  };

  connect = async ({ isChangeIdentity }: IConnectionOptions, { urlOrigin }: IZkMetadata): Promise<void> => {
    const { isApproved, canSkipApprove } = await this.injectorHandler.checkApproval({ urlOrigin });

    try {
      if (isApproved) {
        await this.injectorHandler.getApprovalService().add({ urlOrigin: urlOrigin!, canSkipApprove });
      } else {
        const hostPermission = (await this.injectorHandler.newRequest(PendingRequestType.APPROVE, {
          urlOrigin,
        })) as IHostPermission;

        await this.injectorHandler.getApprovalService().add({
          urlOrigin: hostPermission.urlOrigin,
          canSkipApprove: hostPermission.canSkipApprove,
        });
      }

      const connectedIdentity = await this.injectorHandler.getZkIdentityService().getConnectedIdentity();

      if (connectedIdentity?.metadata.urlOrigin !== urlOrigin || isChangeIdentity) {
        await this.injectorHandler.getZkIdentityService().connectIdentityRequest({ urlOrigin: urlOrigin! });
      }
    } catch (error) {
      throw new Error(`CryptKeeper: error in the connect request, ${(error as Error).message}`);
    }
  };
}
