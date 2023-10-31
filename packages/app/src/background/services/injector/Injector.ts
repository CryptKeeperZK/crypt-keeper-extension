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

  getConnectedIdentityMetadata = (_: unknown, { urlOrigin }: IZkMetadata): ConnectedIdentityMetadata | undefined => {
    const { isApproved, isConnected } = this.injectorHandler.getConnectionData({ urlOrigin });

    if (!isApproved || !isConnected) {
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

      const connectedIdentity = this.injectorHandler.getConnectionService().getConnectedIdentity(urlOrigin!);

      if (!connectedIdentity || isChangeIdentity) {
        await this.injectorHandler.getConnectionService().connectRequest({}, { urlOrigin: urlOrigin! });
      }
    } catch (error) {
      throw new Error(`CryptKeeper: error in the connect request, ${(error as Error).message}`);
    }
  };
}
