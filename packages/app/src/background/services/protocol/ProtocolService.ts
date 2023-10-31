import {
  PendingRequestType,
  type IRLNProofRequest,
  type ISemaphoreProofRequest,
  type IMerkleProofInputs,
  type IZkMetadata,
  type ISemaphoreFullProof,
  type IRLNFullProof,
} from "@cryptkeeperzk/types";
import { ZkProofService } from "@cryptkeeperzk/zk";
import omit from "lodash/omit";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import ConnectionService from "@src/background/services/connection";
import { validateMerkleProofSource } from "@src/background/services/validation";
import { closeChromeOffscreen, createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform, RPCInternalAction } from "@src/constants";
import pushMessage from "@src/util/pushMessage";

export default class ProtocolService {
  private static INSTANCE?: ProtocolService;

  private readonly zkProofService: ZkProofService;

  private readonly requestManager: RequestManager;

  private readonly browserService: BrowserUtils;

  private readonly connectionService: ConnectionService;

  private readonly approvalService: ApprovalService;

  private constructor() {
    this.zkProofService = ZkProofService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.requestManager = RequestManager.getInstance();
    this.connectionService = ConnectionService.getInstance();
    this.approvalService = ApprovalService.getInstance();
  }

  static getInstance(): ProtocolService {
    if (!ProtocolService.INSTANCE) {
      ProtocolService.INSTANCE = new ProtocolService();
    }

    return ProtocolService.INSTANCE;
  }

  generateSemaphoreProof = async (
    { externalNullifier, signal, merkleProofSource }: ISemaphoreProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<ISemaphoreFullProof> => {
    try {
      const checkedSemaphoreProofRequest = await this.prepareSemaphoreProof(
        { externalNullifier, signal, merkleProofSource },
        { urlOrigin },
      );

      const browserPlatform = getBrowserPlatform();

      if (browserPlatform === BrowserPlatform.Firefox) {
        const identity = this.connectionService.getConnectedIdentity(urlOrigin!);
        const proof = await this.zkProofService.generateSemaphoreProof(identity, checkedSemaphoreProofRequest);

        return proof;
      }

      await createChromeOffscreen();

      const fullProof = await pushMessage({
        method: RPCInternalAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: checkedSemaphoreProofRequest,
        meta: urlOrigin,
        source: "offscreen",
      });

      return fullProof as ISemaphoreFullProof;
    } catch (error) {
      throw new Error(`CryptKeeper: Error in generating Semaphore proof ${(error as Error).message}`);
    } finally {
      await closeChromeOffscreen();
    }
  };

  generateRLNProof = async (
    { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource }: IRLNProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<IRLNFullProof> => {
    try {
      const checkedRLNProofRequest = await this.prepareRLNProof(
        { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource },
        { urlOrigin },
      );

      const browserPlatform = getBrowserPlatform();

      if (browserPlatform === BrowserPlatform.Firefox) {
        const identity = this.connectionService.getConnectedIdentity(urlOrigin!);
        const proof = await this.zkProofService.generateRLNProof(identity, checkedRLNProofRequest);

        return proof;
      }

      await createChromeOffscreen();

      const proof = await pushMessage({
        method: RPCInternalAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: checkedRLNProofRequest,
        meta: checkedRLNProofRequest.urlOrigin,
        source: "offscreen",
      });

      return proof as IRLNFullProof;
    } catch (error) {
      throw new Error(`CryptKeeper: Error in generating RLN proof ${(error as Error).message}`);
    } finally {
      await closeChromeOffscreen();
    }
  };

  checkMerkleProofSource = ({ merkleProofSource }: Partial<IMerkleProofInputs>): Partial<IMerkleProofInputs> =>
    validateMerkleProofSource({ merkleProofSource });

  private prepareSemaphoreProof = async (
    { externalNullifier, signal, merkleProofSource }: ISemaphoreProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<ISemaphoreProofRequest> => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: Origin is not set");
    }

    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);

    const checkedZkInputs = this.checkMerkleProofSource({
      merkleProofSource,
    });

    const identity = this.connectionService.getConnectedIdentity(urlOrigin);
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
      urlOrigin,
    };

    if (!canSkipApprove) {
      const request = omit(semaphoreProofRequest, ["identitySerialized"]);

      await this.newRequest(PendingRequestType.SEMAPHORE_PROOF, request);
    }

    return semaphoreProofRequest;
  };

  private prepareRLNProof = async (
    { rlnIdentifier, message, epoch, messageLimit, messageId, merkleProofSource }: IRLNProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<IRLNProofRequest> => {
    if (!urlOrigin) {
      throw new Error("CryptKeeper: Origin is not set");
    }

    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);

    const checkedZkInputs = this.checkMerkleProofSource({
      merkleProofSource,
    });

    const identity = this.connectionService.getConnectedIdentity(urlOrigin);
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
      urlOrigin,
    };

    if (!canSkipApprove) {
      const request = omit(rlnProofRequest, ["identitySerialized"]);

      await this.newRequest(PendingRequestType.RLN_PROOF, request);
    }

    return rlnProofRequest;
  };

  private newRequest = async (type: PendingRequestType, payload: unknown): Promise<unknown> => {
    const response = await this.requestManager.newRequest(type, payload);
    await this.browserService.closePopup();

    return response;
  };
}
