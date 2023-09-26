import {
  IConnectionApprovalData,
  IRLNProofRequest,
  IRLNFullProof,
  ISemaphoreFullProof,
  ISemaphoreProofRequest,
  IMerkleProofInputs,
  IZkMetadata,
  PendingRequestType,
  ConnectedIdentityMetadata,
} from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, ZkProofService } from "@cryptkeeperzk/zk";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import { closeChromeOffscreen, createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform, RPCInternalAction } from "@src/constants";
import pushMessage from "@src/util/pushMessage";

import ApprovalService from "../approval";
import LockerService from "../lock";
import { validateMerkleProofSource } from "../validation";
import ZkIdentityService from "../zkIdentity";

export class InjectorHandler {
  protected lockerService: LockerService;

  protected approvalService: ApprovalService;

  protected zkProofService: ZkProofService;

  protected requestManager: RequestManager;

  protected browserService: BrowserUtils;

  protected zkIdentityService: ZkIdentityService;

  constructor() {
    this.approvalService = ApprovalService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.lockerService = LockerService.getInstance();
    this.requestManager = RequestManager.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
    this.zkProofService = new ZkProofService();
  }

  protected connectedIdentityMetadata = async (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata> => {
    const connectedIdentityMetadata = await this.zkIdentityService.getConnectedIdentityData({}, meta);
    if (!connectedIdentityMetadata) {
      throw new Error(`CryptKeeper: identity metadata is not found`);
    }

    return connectedIdentityMetadata;
  };

  protected newRequest = async (newRequestType: PendingRequestType, newRequestPayload: unknown): Promise<unknown> => {
    try {
      const responsePayload = await this.requestManager.newRequest(newRequestType, newRequestPayload);
      await this.browserService.closePopup();

      return responsePayload;
    } catch (error) {
      throw new Error(`${error as string}`);
    }
  };

  protected requiredApproval = async ({ urlOrigin }: IZkMetadata): Promise<IConnectionApprovalData> => {
    const { checkedUrlOrigin, isApproved, canSkipApprove } = this.getConnectionApprovalData({ urlOrigin });

    // TODO: This check should be not just `isApproved` but also `isConnected`;
    // Because the idea is to force to have a connection via `connectedIdentity()`
    // which includes checking the approval part, this would be done in another PR
    if (!isApproved) {
      throw new Error(`CryptKeeper: ${urlOrigin} is not approved, please do a connect request first.`);
    }

    try {
      await this.checkLock();
    } catch (error) {
      throw new Error(error as string);
    }

    return { checkedUrlOrigin, isApproved, canSkipApprove };
  };

  protected checkApproval = async ({ urlOrigin }: IZkMetadata): Promise<IConnectionApprovalData> => {
    const { checkedUrlOrigin, isApproved, canSkipApprove } = this.getConnectionApprovalData({ urlOrigin });

    try {
      await this.checkLock();
    } catch (error) {
      throw new Error(error as string);
    }

    return { checkedUrlOrigin, isApproved, canSkipApprove };
  };

  private getConnectionApprovalData = ({ urlOrigin }: IZkMetadata): IConnectionApprovalData => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: Origin is not set");
    }

    const isApproved = this.approvalService.isApproved(urlOrigin);
    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);

    return { checkedUrlOrigin: urlOrigin, isApproved, canSkipApprove };
  };

  private checkLock = async () => {
    const { isUnlocked } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      try {
        await this.browserService.openPopup();
        await this.lockerService.awaitUnlock();
      } catch (error) {
        throw new Error(`CryptKeeper: refused to unlock ${error as string}`);
      }
    }
  };

  protected checkMerkleProofSource = ({
    merkleProofSource,
  }: Partial<IMerkleProofInputs>): Partial<IMerkleProofInputs> => validateMerkleProofSource({ merkleProofSource });

  protected computeSemaphoreProof = async (
    identity: ZkIdentitySemaphore,
    semaphoreProofRequest: ISemaphoreProofRequest,
  ): Promise<ISemaphoreFullProof> => {
    const {
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleStorageUrl,
      circuitFilePath,
      zkeyFilePath,
      urlOrigin,
    } = semaphoreProofRequest;

    if (!circuitFilePath || !zkeyFilePath) {
      throw new Error("CryptKeeper: Must set Semaphore circuitFilePath and zkeyFilePath");
    }

    const browserPlatform = getBrowserPlatform();

    if (browserPlatform === BrowserPlatform.Firefox) {
      try {
        const fullProof = await this.zkProofService.generateSemaphoreProof(identity, {
          externalNullifier,
          signal,
          circuitFilePath,
          zkeyFilePath,
          merkleStorageUrl,
          merkleProofArtifacts,
        });

        return fullProof;
      } catch (error) {
        throw new Error(`CryptKeeper: Error in generating Semaphore proof on Firefox ${error as string}`);
      }
    }

    try {
      await createChromeOffscreen();
    } catch (error) {
      throw new Error(`CryptKeeper: on creating Chrome Offscreen page for Semaphore Proof ${error as string}`);
    }

    try {
      const fullProof = await pushMessage({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: semaphoreProofRequest,
        meta: urlOrigin,
        source: "offscreen",
      });

      return fullProof as ISemaphoreFullProof;
    } catch (error) {
      throw new Error(`CryptKeeper: Error in generating Semaphore proof on Chrome ${error as string}`);
    } finally {
      await closeChromeOffscreen();
    }
  };

  protected computeRlnProof = async (
    identity: ZkIdentitySemaphore,
    rlnProofRequest: IRLNProofRequest,
  ): Promise<IRLNFullProof> => {
    if (!rlnProofRequest.circuitFilePath || !rlnProofRequest.zkeyFilePath) {
      throw new Error("CryptKeeper: Must set RLN circuitFilePath and zkeyFilePath");
    }

    const browserPlatform = getBrowserPlatform();

    if (browserPlatform === BrowserPlatform.Firefox) {
      try {
        const rlnFullProof = await this.zkProofService.generateRLNProof(identity, rlnProofRequest);

        return rlnFullProof;
      } catch (error) {
        throw new Error(`CryptKeeper: Error in generating RLN proof on Firefox ${error as string}`);
      }
    }

    try {
      await createChromeOffscreen();
    } catch (error) {
      throw new Error(`CryptKeeper: on creating Chrome Offscreen page for RLN Proof ${error as string}`);
    }

    try {
      const rlnFullProof = await pushMessage({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: rlnProofRequest,
        meta: rlnProofRequest.urlOrigin,
        source: "offscreen",
      });

      return JSON.parse(rlnFullProof as string) as IRLNFullProof;
    } catch (error) {
      throw new Error(`CryptKeeper: Error in generating RLN proof on Chrome ${error as string}`);
    } finally {
      await closeChromeOffscreen();
    }
  };
}
