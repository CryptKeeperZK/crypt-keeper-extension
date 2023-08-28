import { RPCAction } from "@cryptkeeperzk/providers";
import { RLNSNARKProof } from "@cryptkeeperzk/rlnjs";
import { generateProof } from "@cryptkeeperzk/semaphore-proof";
import { getMerkleProof } from "@cryptkeeperzk/zk";
import { omit } from "lodash";
import browser from "webextension-polyfill";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import LockerService from "@src/background/services/lock";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { closeChromeOffscreen, createChromeOffscreen, getBrowserPlatform } from "@src/background/shared/utils";
import { BrowserPlatform } from "@src/constants";
import {
  PendingRequestType,
  IRlnProofRequest,
  SemaphoreFullProof,
  ISemaphoreProofRequest,
  IZkMetadata,
} from "@src/types";
import pushMessage from "@src/util/pushMessage";

import type { IConnectData } from "./types";

export default class InjectorService {
  private static INSTANCE: InjectorService;

  private requestManager: RequestManager;

  private lockerService: LockerService;

  private zkIdentityService: ZkIdentityService;

  private approvalService: ApprovalService;

  private browserService: BrowserUtils;

  private constructor() {
    this.requestManager = RequestManager.getInstance();
    this.lockerService = LockerService.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
    this.approvalService = ApprovalService.getInstance();
    this.browserService = BrowserUtils.getInstance();
  }

  static getInstance(): InjectorService {
    if (!InjectorService.INSTANCE) {
      InjectorService.INSTANCE = new InjectorService();
    }

    return InjectorService.INSTANCE;
  }

  connect = async ({ urlOrigin }: IZkMetadata): Promise<IConnectData> => {
    if (!urlOrigin) {
      throw new Error("Origin is not set");
    }

    const { isUnlocked } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();
    }

    const isApproved = this.approvalService.isApproved(urlOrigin);
    const canSkipApprove = this.approvalService.canSkipApprove(urlOrigin);

    if (isApproved) {
      return { isApproved, canSkipApprove };
    }

    try {
      await this.requestManager.newRequest(PendingRequestType.CONNECT, { urlOrigin });
      return { isApproved: true, canSkipApprove: false };
    } catch (e) {
      return { isApproved: false, canSkipApprove: false };
    } finally {
      await this.browserService.closePopup();
    }
  };

  generateSemaphoreProof = async (
    {
      externalNullifier,
      signal,
      merkleProofProvided,
      merkleProofArtifacts,
      merkleStorageAddress,
    }: ISemaphoreProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<SemaphoreFullProof> => {
    if (!urlOrigin) {
      throw new Error("Origin is not set");
    }

    const browserPlatform = getBrowserPlatform();
    const { isUnlocked } = await this.lockerService.getStatus();

    const semaphorePath = {
      circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
      zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
      verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
    };

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();
    }

    const identity = await this.zkIdentityService.getConnectedIdentity();
    const approved = this.approvalService.isApproved(urlOrigin);
    const permission = this.approvalService.getPermission(urlOrigin);
    const identitySerialized = identity?.serialize();

    if (!identity || !identitySerialized) {
      throw new Error("connected identity not found");
    }

    if (!approved) {
      throw new Error(`${urlOrigin} is not approved`);
    }

    const semaphoreRequest: ISemaphoreProofRequest = {
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleStorageAddress,
      merkleProofProvided,
      identitySerialized,
      circuitFilePath: semaphorePath.circuitFilePath,
      zkeyFilePath: semaphorePath.zkeyFilePath,
      verificationKey: semaphorePath.verificationKey,
      urlOrigin,
    };

    if (!permission.canSkipApprove) {
      const request = omit(semaphoreRequest, ["identitySerialized"]);

      await this.requestManager.newRequest(PendingRequestType.SEMAPHORE_PROOF, request);
      await this.browserService.closePopup();
    }

    try {
      // TODO: This is a temporary solution ONLY FOR FIREFOX for generating SemaphoreProofs from the background on MV2
      if (browserPlatform === BrowserPlatform.Firefox) {
        const identityCommitment = identity.genIdentityCommitment();

        const merkleProof = await getMerkleProof({
          identityCommitment,
          merkleProofArtifacts,
        });

        if (!semaphoreRequest.circuitFilePath || !semaphoreRequest.zkeyFilePath) {
          throw new Error("Injected service: Must set circuitFilePath and zkeyFilePath");
        }

        const fullProof = await generateProof(identity.zkIdentity, merkleProof, externalNullifier, signal, {
          wasmFilePath: semaphoreRequest.circuitFilePath,
          zkeyFilePath: semaphoreRequest.zkeyFilePath,
        });

        return fullProof;
      }

      await createChromeOffscreen();

      const fullProof = await pushMessage({
        method: RPCAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN,
        payload: semaphoreRequest,
        meta: urlOrigin,
        source: "offscreen",
      });

      return fullProof as SemaphoreFullProof;
    } catch (error) {
      throw new Error(`Error in generateSemaphoreProof(): ${(error as Error).message}`);
    } finally {
      if (browserPlatform !== BrowserPlatform.Firefox) {
        await closeChromeOffscreen();
      }
    }
  };

  generateRlnProof = async (
    {
      rlnIdentifier,
      message,
      epoch,
      merkleProofProvided,
      merkleProofArtifacts,
      merkleStorageAddress,
      messageLimit,
      messageId,
    }: IRlnProofRequest,
    { urlOrigin }: IZkMetadata,
  ): Promise<RLNSNARKProof> => {
    if (!urlOrigin) {
      throw new Error("Origin is not set");
    }

    const browserPlatform = getBrowserPlatform();
    const { isUnlocked } = await this.lockerService.getStatus();

    const rlnPath = {
      circuitFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.wasm"),
      zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
      verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
    };

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();
    }

    const identity = await this.zkIdentityService.getConnectedIdentity();
    const approved = this.approvalService.isApproved(urlOrigin);
    const permission = this.approvalService.getPermission(urlOrigin);
    const serializedIdentity = identity?.serialize();

    if (!identity || !serializedIdentity) {
      throw new Error("connected identity not found");
    }

    if (!approved) {
      throw new Error(`${urlOrigin} is not approved`);
    }

    const rlnProofRequest: IRlnProofRequest = {
      rlnIdentifier,
      message,
      epoch,
      merkleProofProvided,
      merkleProofArtifacts,
      merkleStorageAddress,
      messageLimit,
      messageId,
      identitySerialized: serializedIdentity,
      circuitFilePath: rlnPath.circuitFilePath,
      zkeyFilePath: rlnPath.zkeyFilePath,
      verificationKey: rlnPath.verificationKey,
      urlOrigin,
    };

    if (!permission.canSkipApprove) {
      const request = omit(rlnProofRequest, ["identitySerialized"]);

      await this.requestManager.newRequest(PendingRequestType.RLN_PROOF, request);
      await this.browserService.closePopup();
    }

    try {
      // TODO: support RLN in Firefox
      if (browserPlatform === BrowserPlatform.Firefox) {
        throw new Error("RLN proofs are not supported with Firefox");
      }

      await createChromeOffscreen();

      const rlnFullProof = await pushMessage({
        method: RPCAction.GENERATE_RLN_PROOF_OFFSCREEN,
        payload: rlnProofRequest,
        meta: urlOrigin,
        source: "offscreen",
      });

      return JSON.parse(rlnFullProof as string) as RLNSNARKProof;
    } catch (error) {
      throw new Error(`Error in generateRlnProof(): ${(error as Error).message}`);
    } finally {
      if (browserPlatform !== BrowserPlatform.Firefox) {
        await closeChromeOffscreen();
      }
    }
  };
}
