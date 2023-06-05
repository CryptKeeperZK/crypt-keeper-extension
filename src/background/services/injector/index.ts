import { Approvals, ConnectedIdentityData, PendingRequestType, RLNProofRequest, SemaphoreProofRequest } from "@src/types";
import log from "loglevel";
import LockerService from "../lock";
import BrowserUtils from "@src/background/controllers/browserUtils";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "../approval";
import ZkIdentityService from "../zkIdentity";
import { browser } from "webextension-polyfill-ts";

// @src InjectorService is a service for helping the injectedScript provider
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

  // TODO: This function is complicated and needs to be simplified in smaller private functions, that will be done in another PR. 
  connect = async (payload: { origin: string }): Promise<ConnectedIdentityData> => {
    const { origin: host } = payload;
    if (!host) {
      throw new Error("Origin not provided");
    }

    // Check Locker
    const { isUnlocked } = await this.lockerService.getStatus();

    if (!isUnlocked) {
      await this.browserService.openPopup();
      await this.lockerService.awaitUnlock();
    }

    // Check Approval
    const isApproved = this.approvalService.isApproved(host);

    let approvalResponse: Approvals = {
      isApproved: false,
      canSkipApprove: false,
    };

    if (!isApproved) {
      try {
        await this.requestManager.newRequest(PendingRequestType.APPROVE, { origin: host });
        const canSkipApproveResponse = this.approvalService.canSkipApprove(host);
        approvalResponse = { isApproved: true, canSkipApprove: canSkipApproveResponse };
      } catch (e) {
        throw new Error("User rejected to connect!")
      }
    }

    if (isApproved || approvalResponse.isApproved) {
      await this.approvalService.add({ host, canSkipApprove: approvalResponse.canSkipApprove });
      await this.zkIdentityService.setIdentityHost({ host });

      // Check Identity
      // 1.1 Check available identities
      const availableIdentities = await this.zkIdentityService.getHostIdentitis({ host });

      // 1.2 If there are available identities
      //     This option means that user requesting either `ConnectedIdentityData` or `IdentityMetadata`
      if (availableIdentities.length !== 0) {
        try {
          await this.requestManager.newRequest(PendingRequestType.CHECK_AVIABLE_IDENTITIES, { host });
          // 1.3 If all the above are passed successfully, that means there is a successful connected identity.
          const data = await this.zkIdentityService.getConnectedIdentityData()
          console.log(`Inside provider:`)
          console.log(data)
          return data;
        } catch (error) {
          // That means the user clicks on the (x) button to close the window.
          throw new Error("User rejected to connect!");
        }
      }

      // 1.4 If there are no available identities
      //     This option means that user requesting `ConnectedIdentityData`
      try {
        await this.requestManager.newRequest(PendingRequestType.CREATE_IDENTITY, { host });
        // 1.5 If all the above are passed successfully, that means there is a successful connected identity.
        return this.zkIdentityService.getConnectedIdentityData();
      } catch (error) {
        throw new Error("User rejected to connect!");
      }
    } else {
        throw new Error("User rejected to connect!");
    }
  };

  prepareSemaphoreProofRequest = async (payload: SemaphoreProofRequest, meta: { origin: string }) => {
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

  prepareRLNProofRequest = async (payload: RLNProofRequest, meta: { origin: string }) => {
    const identity = await this.zkIdentityService.getActiveIdentity();
    const approved = this.approvalService.isApproved(meta.origin);
    const permission = this.approvalService.getPermission(meta.origin);

    const rlnPath = {
      circuitFilePath: browser.runtime.getURL("js/zkeyFiles//rln/rln.wasm"),
      zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
      verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
    };

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
