import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { BrowserController } from "@src/background/controllers/browser";
import { HandlerController } from "@src/background/controllers/handler";
import { RequestManagerController } from "@src/background/controllers/requestManager";
import { ApprovalService } from "@src/background/services/approval";
import { HistoryService } from "@src/background/services/history";
import { IdentityService, identityFactory } from "@src/background/services/identity";
import { LockService } from "@src/background/services/lock";
import { WalletService } from "@src/background/services/wallet";
import { Paths, RPCAction } from "@src/constants";
import {
  PendingRequestType,
  NewIdentityRequest,
  IdentityName,
  RLNProofRequest,
  SemaphoreProofRequest,
} from "@src/types";

import { validateZkInputs } from "./services/validator/zkValidator";

export default class CryptKeeperController extends HandlerController {
  private identityService: IdentityService;

  private approvalService: ApprovalService;

  private walletService: WalletService;

  private lockService: LockService;

  private historyService: HistoryService;

  private browsercontroller: BrowserController;

  private requestManagerController: RequestManagerController;

  public constructor() {
    super();
    this.identityService = new IdentityService();
    this.requestManagerController = new RequestManagerController();
    this.approvalService = new ApprovalService();
    this.walletService = new WalletService();
    this.lockService = LockService.getInstance();
    this.browsercontroller = BrowserController.getInstance();
    this.historyService = HistoryService.getInstance();
  }

  public initialize = (): CryptKeeperController => {
    // common
    this.add(
      RPCAction.UNLOCK,
      this.lockService.unlock,
      this.identityService.unlock,
      this.approvalService.unlock,
      this.lockService.onUnlocked,
    );

    this.add(RPCAction.LOCK, this.lockService.logout);

    /**
     *  Return status of background process
     *  @returns {Object} status Background process status
     *  @returns {boolean} status.isInitialized has background process been initialized
     *  @returns {boolean} status.isUnlocked is background process unlocked
     */
    this.add(RPCAction.GET_STATUS, this.lockService.getStatus);

    // requests
    this.add(RPCAction.GET_PENDING_REQUESTS, this.lockService.ensure, this.requestManagerController.getRequests);
    this.add(RPCAction.FINALIZE_REQUEST, this.lockService.ensure, this.requestManagerController.finalizeRequest);

    // lock
    this.add(RPCAction.SETUP_PASSWORD, (payload: string) => this.lockService.setupPassword(payload));

    // Identities
    this.add(RPCAction.GET_COMMITMENTS, this.lockService.ensure, this.identityService.getIdentityCommitments);
    this.add(RPCAction.GET_IDENTITIES, this.lockService.ensure, this.identityService.getIdentities);
    this.add(RPCAction.GET_ACTIVE_IDENTITY_DATA, this.lockService.ensure, this.identityService.getActiveIdentityData);
    this.add(RPCAction.SET_ACTIVE_IDENTITY, this.lockService.ensure, this.identityService.setActiveIdentity);
    this.add(RPCAction.SET_IDENTITY_NAME, this.lockService.ensure, async (payload: IdentityName) =>
      this.identityService.setIdentityName(payload),
    );

    this.add(RPCAction.DELETE_IDENTITY, this.lockService.ensure, async (payload: IdentityName) =>
      this.identityService.deleteIdentity(payload),
    );

    this.add(RPCAction.DELETE_ALL_IDENTITIES, this.lockService.ensure, this.identityService.deleteAllIdentities);

    this.add(RPCAction.CREATE_IDENTITY_REQ, this.lockService.ensure, async () => {
      await this.browsercontroller.openPopup({ params: { redirect: Paths.CREATE_IDENTITY } });
    });

    this.add(RPCAction.CREATE_IDENTITY, this.lockService.ensure, async (payload: NewIdentityRequest) => {
      const { strategy, messageSignature, options } = payload;

      if (!strategy) {
        throw new Error("strategy not provided");
      }

      const numOfIdentites = await this.identityService.getNumOfIdentites();
      const config = {
        ...options,
        account: options.account ?? "",
        identityStrategy: strategy,
        name: options?.name || `Account # ${numOfIdentites}`,
        messageSignature: strategy === "interrep" ? messageSignature : undefined,
      };

      const identity = identityFactory(strategy, config);

      if (!identity) {
        throw new Error("Identity not created, make sure to check strategy");
      }

      await this.identityService.insert(identity);

      await this.browsercontroller.closePopup();

      return true;
    });

    this.add(RPCAction.LOAD_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.loadOperations);

    this.add(RPCAction.GET_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.getOperations);

    this.add(RPCAction.DELETE_HISTORY_OPERATION, this.lockService.ensure, this.historyService.removeOperation);

    this.add(RPCAction.DELETE_ALL_HISTORY_OPERATIONS, this.lockService.ensure, this.historyService.clear);

    this.add(RPCAction.ENABLE_OPERATION_HISTORY, this.lockService.ensure, this.historyService.enableHistory);

    // Protocols
    this.add(
      RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      async (payload: SemaphoreProofRequest, meta: { origin: string }) => {
        const { isUnlocked } = await this.lockService.getStatus();

        const semaphorePath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
        };

        if (!isUnlocked) {
          await this.browsercontroller.openPopup();
          await this.lockService.awaitUnlock();
        }

        const identity = await this.identityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = this.approvalService.getPermission(meta.origin);

        if (!identity) throw new Error("active identity not found");
        if (!approved) throw new Error(`${meta.origin} is not approved`);

        try {
          const request = {
            ...payload,
            circuitFilePath: semaphorePath.circuitFilePath,
            zkeyFilePath: semaphorePath.zkeyFilePath,
            verificationKey: semaphorePath.verificationKey,
          };

          if (!permission.noApproval) {
            await this.requestManagerController.newRequest(PendingRequestType.SEMAPHORE_PROOF, {
              ...request,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload: request };
        } finally {
          await this.browsercontroller.closePopup();
        }
      },
    );

    this.add(
      RPCAction.PREPARE_RLN_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      async (payload: RLNProofRequest, meta: { origin: string }) => {
        const identity = await this.identityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = this.approvalService.getPermission(meta.origin);

        const rlnPath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles//rln/rln.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
        };

        if (!identity) throw new Error("active identity not found");
        if (!approved) throw new Error(`${meta.origin} is not approved`);

        try {
          const request = {
            ...payload,
            circuitFilePath: rlnPath.circuitFilePath,
            zkeyFilePath: rlnPath.zkeyFilePath,
            verificationKey: rlnPath.verificationKey,
          };

          if (!permission.noApproval) {
            await this.requestManagerController.newRequest(PendingRequestType.RLN_PROOF, {
              ...request,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload: request };
        } finally {
          await this.browsercontroller.closePopup();
        }
      },
    );

    // Injecting
    this.add(RPCAction.TRY_INJECT, async (payload: { origin: string }) => {
      const { origin: host } = payload;
      if (!host) throw new Error("Origin not provided");

      const { isUnlocked } = await this.lockService.getStatus();

      if (!isUnlocked) {
        await this.browsercontroller.openPopup();
        await this.lockService.awaitUnlock();
      }

      const isApproved = this.approvalService.isApproved(host);
      const canSkipApprove = this.approvalService.canSkipApprove(host);

      if (isApproved) return { isApproved, canSkipApprove };

      try {
        await this.requestManagerController.newRequest(PendingRequestType.INJECT, { origin: host });
        return { isApproved: true, canSkipApprove: false };
      } catch (e) {
        log.error(e);
        return { isApproved: false, canSkipApprove: false };
      }
    });

    // Approvals
    this.add(RPCAction.APPROVE_HOST, this.lockService.ensure, this.approvalService.add);
    this.add(RPCAction.IS_HOST_APPROVED, this.lockService.ensure, this.approvalService.isApproved);
    this.add(RPCAction.REMOVE_HOST, this.lockService.ensure, this.approvalService.remove);
    this.add(RPCAction.GET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.getPermission);
    this.add(RPCAction.SET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.setPermission);
    // Approvals - DEV ONLY
    this.add(RPCAction.CLEAR_APPROVED_HOSTS, this.approvalService.clear);

    this.add(RPCAction.SET_CONNECT_WALLET, this.lockService.ensure, this.walletService.setConnection);

    this.add(RPCAction.GET_CONNECT_WALLET, this.lockService.ensure, this.walletService.getConnection);

    this.add(RPCAction.CLOSE_POPUP, async () => this.browsercontroller.closePopup());

    return this;
  };
}
