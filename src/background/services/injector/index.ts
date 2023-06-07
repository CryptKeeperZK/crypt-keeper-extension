import { browser } from "webextension-polyfill-ts";

import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import LockerService from "@src/background/services/lock";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { PendingRequestType, RLNProofRequest, SemaphoreProofRequest } from "@src/types";

import type { IConnectData, IMeta, IProofRequest } from "./types";

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

  connect = async ({ origin: host }: IMeta): Promise<IConnectData> => {
    if (!host) {
      throw new Error("Origin not provided");
    }

    const { isUnlocked } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();
    }

    const isApproved = this.approvalService.isApproved(host);
    const canSkipApprove = this.approvalService.canSkipApprove(host);

    if (isApproved) {
      return { isApproved, canSkipApprove };
    }

    try {
      await this.requestManager.newRequest(PendingRequestType.INJECT, { origin: host });
      return { isApproved: true, canSkipApprove: false };
    } catch (e) {
      return { isApproved: false, canSkipApprove: false };
    }
  };

  prepareSemaphoreProofRequest = async (
    payload: SemaphoreProofRequest,
    meta: IMeta,
  ): Promise<IProofRequest<SemaphoreProofRequest>> => {
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

    const identity = await this.zkIdentityService.getActiveIdentity();
    const approved = this.approvalService.isApproved(meta.origin);
    const permission = this.approvalService.getPermission(meta.origin);

    if (!identity) {
      throw new Error("active identity not found");
    }

    if (!approved) {
      throw new Error(`${meta.origin} is not approved`);
    }

    try {
      const request = {
        ...payload,
        circuitFilePath: semaphorePath.circuitFilePath,
        zkeyFilePath: semaphorePath.zkeyFilePath,
        verificationKey: semaphorePath.verificationKey,
      };

      if (!permission.canSkipApprove) {
        await this.requestManager.newRequest(PendingRequestType.SEMAPHORE_PROOF, {
          ...request,
          origin: meta.origin,
        });
      }

      return { identity: identity.serialize(), payload: request };
    } finally {
      await this.browserService.closePopup();
    }
  };

  prepareRlnProofRequest = async (payload: RLNProofRequest, meta: IMeta): Promise<IProofRequest<RLNProofRequest>> => {
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

    const identity = await this.zkIdentityService.getActiveIdentity();
    const approved = this.approvalService.isApproved(meta.origin);
    const permission = this.approvalService.getPermission(meta.origin);

    if (!identity) {
      throw new Error("active identity not found");
    }

    if (!approved) {
      throw new Error(`${meta.origin} is not approved`);
    }

    try {
      const request = {
        ...payload,
        circuitFilePath: rlnPath.circuitFilePath,
        zkeyFilePath: rlnPath.zkeyFilePath,
        verificationKey: rlnPath.verificationKey,
      };

      if (!permission.canSkipApprove) {
        await this.requestManager.newRequest(PendingRequestType.RLN_PROOF, {
          ...request,
          origin: meta.origin,
        });
      }

      return { identity: identity.serialize(), payload: request };
    } finally {
      await this.browserService.closePopup();
    }
  };
}
