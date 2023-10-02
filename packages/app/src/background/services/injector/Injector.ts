import {
  PendingRequestType,
  IRLNProofRequest,
  ISemaphoreFullProof,
  ISemaphoreProofRequest,
  IZkMetadata,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IHostPermission,
} from "@cryptkeeperzk/types";
import { identity } from "webextension-polyfill";

import { closeChromeOffscreen, createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform, RPCInternalAction } from "@src/constants";
import pushMessage from "@src/util/pushMessage";

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

  getConnectedIdentityMetadata = async (
    _: unknown,
    { urlOrigin }: IZkMetadata,
  ): Promise<ConnectedIdentityMetadata | undefined> => {
    const { isApproved } = this.injectorHandler.getConnectionApprovalData({ urlOrigin });

    if (!isApproved) {
      return undefined;
    }

    return this.injectorHandler.connectedIdentityMetadata({}, { urlOrigin });
  };

  connectIdentity = async ({ urlOrigin }: IZkMetadata): Promise<ConnectedIdentityMetadata> => {
    const { checkedUrlOrigin, isApproved, canSkipApprove } = await this.injectorHandler.checkApproval({ urlOrigin });

    if (isApproved) {
      await this.injectorHandler.approvalService.add({ urlOrigin: checkedUrlOrigin, canSkipApprove });
    } else {
      try {
        const hostPermissionChecks = (await this.injectorHandler.newRequest(PendingRequestType.APPROVE, {
          urlOrigin,
        })) as IHostPermission;
        await this.injectorHandler.approvalService.add({
          urlOrigin: hostPermissionChecks.urlOrigin,
          canSkipApprove: hostPermissionChecks.canSkipApprove,
        });
      } catch (error) {
        throw new Error(`CryptKeeper: error in the approve request, ${(error as Error).message}`);
      }
    }

    try {
      await this.injectorHandler.newRequest(PendingRequestType.CONNECT_IDENTITY, { urlOrigin });
    } catch (error) {
      throw new Error(`CryptKeeper: error in the connect request, ${(error as Error).message}`);
    }

    const connectedIdentity = await this.injectorHandler.connectedIdentityMetadata({}, { urlOrigin });

    await this.injectorHandler.browserService.closePopup();

    return connectedIdentity;
  };

  generateSemaphoreProof = async (
    { externalNullifier, signal, merkleProofSource }: ISemaphoreProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<ISemaphoreFullProof> => {
    const checkedSemaphoreProofRequest = await this.injectorHandler.prepareSemaphoreProof(
      {
        externalNullifier,
        signal,
        merkleProofSource,
      },
      { urlOrigin },
    );

    const browserPlatform = getBrowserPlatform();

    if (browserPlatform === BrowserPlatform.Firefox) {
      try {
        const fullProof = await this.injectorHandler.zkProofService.generateSemaphoreProof(
          identity,
          checkedSemaphoreProofRequest,
        );

        return fullProof;
      } catch (error) {
        throw new Error(`CryptKeeper: Error in generating Semaphore proof on Firefox ${(error as Error).message}`);
      }
    }

    try {
      await createChromeOffscreen();
    } catch (error) {
      throw new Error(`CryptKeeper: on creating Chrome Offscreen page for Semaphore Proof ${(error as Error).message}`);
    }

    try {
      const fullProof = await pushMessage({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: checkedSemaphoreProofRequest,
        meta: urlOrigin,
        source: "offscreen",
      });

      return fullProof as ISemaphoreFullProof;
    } catch (error) {
      throw new Error(`CryptKeeper: Error in generating Semaphore proof on Chrome ${(error as Error).message}`);
    } finally {
      await closeChromeOffscreen();
    }
  };

  generateRLNProof = async (
    { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource }: IRLNProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<IRLNFullProof> => {
    const checkedRLNProofRequest = await this.injectorHandler.prepareRLNProof(
      { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource },
      {
        urlOrigin,
      },
    );

    const browserPlatform = getBrowserPlatform();

    if (browserPlatform === BrowserPlatform.Firefox) {
      try {
        const rlnFullProof = await this.injectorHandler.zkProofService.generateRLNProof(
          identity,
          checkedRLNProofRequest,
        );

        return rlnFullProof;
      } catch (error) {
        throw new Error(`CryptKeeper: Error in generating RLN proof on Firefox ${(error as Error).message}`);
      }
    }

    try {
      await createChromeOffscreen();
    } catch (error) {
      throw new Error(`CryptKeeper: on creating Chrome Offscreen page for RLN Proof ${(error as Error).message}`);
    }

    try {
      const rlnFullProof = await pushMessage({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: checkedRLNProofRequest,
        meta: checkedRLNProofRequest.urlOrigin,
        source: "offscreen",
      });

      return JSON.parse(rlnFullProof as string) as IRLNFullProof;
    } catch (error) {
      throw new Error(`CryptKeeper: Error in generating RLN proof on Chrome ${(error as Error).message}`);
    } finally {
      await closeChromeOffscreen();
    }
  };
}
