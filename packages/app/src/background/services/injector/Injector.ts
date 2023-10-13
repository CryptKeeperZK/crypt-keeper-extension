import {
  PendingRequestType,
  IRLNProofRequest,
  ISemaphoreFullProof,
  ISemaphoreProofRequest,
  IZkMetadata,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IHostPermission,
  IJoinGroupMemberArgs,
  IGenerateGroupMerkleProofArgs,
} from "@cryptkeeperzk/types";
import { IConnectionOptions } from "@cryptkeeperzk/types/dist/src/approval";
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
    const { checkedUrlOrigin, isApproved, canSkipApprove } = await this.injectorHandler.checkApproval({ urlOrigin });

    try {
      if (isApproved) {
        await this.injectorHandler.getApprovalService().add({ urlOrigin: checkedUrlOrigin, canSkipApprove });
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
        const fullProof = await this.injectorHandler
          .getZkProofService()
          .generateSemaphoreProof(identity, checkedSemaphoreProofRequest);

        return fullProof;
      } catch (error) {
        throw new Error(`CryptKeeper: Error in generating Semaphore proof on Firefox ${(error as Error).message}`);
      }
    }

    try {
      await createChromeOffscreen();
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
      { urlOrigin },
    );

    const browserPlatform = getBrowserPlatform();

    if (browserPlatform === BrowserPlatform.Firefox) {
      try {
        const rlnFullProof = await this.injectorHandler
          .getZkProofService()
          .generateRLNProof(identity, checkedRLNProofRequest);

        return rlnFullProof;
      } catch (error) {
        throw new Error(`CryptKeeper: Error in generating RLN proof on Firefox ${(error as Error).message}`);
      }
    }

    try {
      await createChromeOffscreen();
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

  joinGroup = async (
    { groupId, apiKey, inviteCode }: IJoinGroupMemberArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    try {
      await this.injectorHandler.requiredApproval({ urlOrigin });
      await this.injectorHandler.getGroupService().joinGroupRequest({ groupId, apiKey, inviteCode });
    } catch (error) {
      throw new Error(`CryptKeeper: joining a group via Bandada service ${(error as Error).message}`);
    }
  };

  generateGroupMerkleProof = async (
    { groupId }: IGenerateGroupMerkleProofArgs,
    { urlOrigin }: IZkMetadata,
  ): Promise<void> => {
    try {
      await this.injectorHandler.requiredApproval({ urlOrigin });
      await this.injectorHandler.getGroupService().generateGroupMerkleProofRequest({ groupId });
    } catch (error) {
      throw new Error(`CryptKeeper: generate Merkle Proof via Bandada service ${(error as Error).message}`);
    }
  };
}
