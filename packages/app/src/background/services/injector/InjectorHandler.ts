import {
  IConnectionApprovalData,
  IRLNProofRequest,
  ISemaphoreProofRequest,
  IMerkleProofInputs,
  IZkMetadata,
  PendingRequestType,
  ConnectedIdentityMetadata,
} from "@cryptkeeperzk/types";
import { ZkProofService } from "@cryptkeeperzk/zk";
import { omit } from "lodash";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import LockerService from "@src/background/services/lock";
import { validateMerkleProofSource } from "@src/background/services/validation";
import ZkIdentityService from "@src/background/services/zkIdentity";

export class InjectorHandler {
  private readonly lockerService: LockerService;

  private readonly approvalService: ApprovalService;

  private readonly zkProofService: ZkProofService;

  private readonly requestManager: RequestManager;

  private readonly browserService: BrowserUtils;

  private readonly zkIdentityService: ZkIdentityService;

  constructor() {
    this.approvalService = ApprovalService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.lockerService = LockerService.getInstance();
    this.requestManager = RequestManager.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
    this.zkProofService = new ZkProofService();
  }

  getApprovalService = (): ApprovalService => this.approvalService;

  getZkIdentityService = (): ZkIdentityService => this.zkIdentityService;

  getZkProofService = (): ZkProofService => this.zkProofService;

  getLockService = (): LockerService => this.lockerService;

  connectedIdentityMetadata = async (_: unknown, meta?: IZkMetadata): Promise<ConnectedIdentityMetadata> => {
    const connectedIdentityMetadata = await this.zkIdentityService.getConnectedIdentityData({}, meta);

    if (!connectedIdentityMetadata) {
      throw new Error(`CryptKeeper: identity metadata is not found`);
    }

    return connectedIdentityMetadata;
  };

  newRequest = async (newRequestType: PendingRequestType, newRequestPayload: unknown): Promise<unknown> => {
    const responsePayload = await this.requestManager.newRequest(newRequestType, newRequestPayload);
    await this.browserService.closePopup();

    return responsePayload;
  };

  requiredApproval = async ({ urlOrigin }: IZkMetadata): Promise<IConnectionApprovalData> => {
    const { checkedUrlOrigin, isApproved, canSkipApprove } = this.getConnectionApprovalData({ urlOrigin });

    // TODO: This check should be not just `isApproved` but also `isConnected`;
    // Because the idea is to force to have a connection via `connectedIdentity()`
    // which includes checking the approval part, this would be done in another PR
    if (!isApproved) {
      throw new Error(`CryptKeeper: ${urlOrigin} is not approved, please call 'connect()' request first.`);
    }

    await this.checkUnlockStatus();

    return { checkedUrlOrigin, isApproved, canSkipApprove };
  };

  checkApproval = async ({ urlOrigin }: IZkMetadata): Promise<IConnectionApprovalData> => {
    await this.checkUnlockStatus();
    const { checkedUrlOrigin, isApproved, canSkipApprove } = this.getConnectionApprovalData({ urlOrigin });
    return { checkedUrlOrigin, isApproved, canSkipApprove };
  };

  getConnectionApprovalData = ({ urlOrigin }: IZkMetadata): IConnectionApprovalData => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: Origin is not set");
    }

    const isApproved = this.approvalService.isApproved(urlOrigin);
    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);

    return { checkedUrlOrigin: urlOrigin, isApproved, canSkipApprove };
  };

  private checkUnlockStatus = async () => {
    const { isUnlocked, isInitialized } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();
    }

    if (isInitialized) {
      await this.zkIdentityService.awaitUnlock();
      await this.approvalService.awaitUnlock();
    }
  };

  checkMerkleProofSource = ({ merkleProofSource }: Partial<IMerkleProofInputs>): Partial<IMerkleProofInputs> =>
    validateMerkleProofSource({ merkleProofSource });

  prepareSemaphoreProof = async (
    { externalNullifier, signal, merkleProofSource }: ISemaphoreProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<ISemaphoreProofRequest> => {
    const { checkedUrlOrigin, canSkipApprove } = await this.requiredApproval({ urlOrigin });

    const checkedZkInputs = this.checkMerkleProofSource({
      merkleProofSource,
    });

    const identity = await this.zkIdentityService.getConnectedIdentity();
    const identitySerialized = identity?.serialize();

    if (!identity || !identitySerialized) {
      throw new Error("CryptKeeper: connected identity is not found");
    }

    const semaphorePath = {
      circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
      zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
      verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
    };

    if (!semaphorePath.circuitFilePath || !semaphorePath.zkeyFilePath) {
      throw new Error("CryptKeeper: Must set Semaphore circuitFilePath and zkeyFilePath");
    }

    const semaphoreProofRequest: ISemaphoreProofRequest = {
      externalNullifier,
      signal,
      merkleProofProvided: checkedZkInputs.merkleProofProvided,
      merkleProofArtifacts: checkedZkInputs.merkleProofArtifacts,
      merkleStorageUrl: checkedZkInputs.merkleStorageUrl,
      identitySerialized,
      circuitFilePath: semaphorePath.circuitFilePath,
      zkeyFilePath: semaphorePath.zkeyFilePath,
      verificationKey: semaphorePath.verificationKey,
      urlOrigin: checkedUrlOrigin,
    };

    if (!canSkipApprove) {
      const request = omit(semaphoreProofRequest, ["identitySerialized"]);

      try {
        await this.newRequest(PendingRequestType.SEMAPHORE_PROOF, request);
      } catch (error) {
        throw new Error(`CryptKeeper: error in the Semaphore approve request ${(error as Error).message}`);
      }
    }

    return semaphoreProofRequest;
  };

  prepareRLNProof = async (
    { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource }: IRLNProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<IRLNProofRequest> => {
    const { checkedUrlOrigin, canSkipApprove } = await this.requiredApproval({ urlOrigin });

    const checkedZkInputs = this.checkMerkleProofSource({
      merkleProofSource,
    });

    const identity = await this.zkIdentityService.getConnectedIdentity();
    const identitySerialized = identity?.serialize();

    if (!identity || !identitySerialized) {
      throw new Error("CryptKeeper: connected identity is not found");
    }

    const rlnPath = {
      circuitFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.wasm"),
      zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
      verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
    };

    if (!rlnPath.circuitFilePath || !rlnPath.zkeyFilePath) {
      throw new Error("CryptKeeper: Must set RLN circuitFilePath and zkeyFilePath");
    }

    const rlnProofRequest: IRLNProofRequest = {
      rlnIdentifier,
      message,
      epoch,
      merkleProofProvided: checkedZkInputs.merkleProofProvided,
      merkleProofArtifacts: checkedZkInputs.merkleProofArtifacts,
      merkleStorageUrl: checkedZkInputs.merkleStorageUrl,
      messageLimit,
      messageId,
      identitySerialized,
      circuitFilePath: rlnPath.circuitFilePath,
      zkeyFilePath: rlnPath.zkeyFilePath,
      verificationKey: rlnPath.verificationKey,
      urlOrigin: checkedUrlOrigin,
    };

    if (!canSkipApprove) {
      const request = omit(rlnProofRequest, ["identitySerialized"]);

      try {
        await this.newRequest(PendingRequestType.RLN_PROOF, request);
      } catch (error) {
        throw new Error(`CryptKeeper: error in the RLN approve request ${(error as Error).message}`);
      }
    }

    return rlnProofRequest;
  };
}
