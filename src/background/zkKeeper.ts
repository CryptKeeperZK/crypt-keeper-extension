import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { Paths, RPCAction } from "@src/constants";
import { PendingRequestType, NewIdentityRequest, IdentityName } from "@src/types";

import BrowserUtils from "./controllers/browserUtils";
import Handler from "./controllers/handler";
import RequestManager from "./controllers/requestManager";
import identityFactory from "./identityFactory";
import ApprovalService from "./services/approval";
import HistoryService from "./services/history";
import IdentityService from "./services/identity";
import LockService from "./services/lock";
import { RLNProofRequest, SemaphoreProofRequest } from "./services/protocols/interfaces";
import WalletService from "./services/wallet";
import { validateZkInputs } from "./services/zkValidator";

export default class ZkKeeperController extends Handler {
  private identityService: IdentityService;

  private requestManager: RequestManager;

  private approvalService: ApprovalService;

  private walletService: WalletService;

  private lockService: LockService;

  private browserService: BrowserUtils;

  private historyService: HistoryService;

  public constructor() {
    super();
    this.identityService = new IdentityService();
    this.requestManager = new RequestManager();
    this.approvalService = new ApprovalService();
    this.walletService = new WalletService();
    this.lockService = LockService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.historyService = HistoryService.getInstance();

    log.debug("Inside ZkKepperController");
  }

  public initialize = (): ZkKeeperController => {
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
    this.add(RPCAction.GET_PENDING_REQUESTS, this.lockService.ensure, this.requestManager.getRequests);
    this.add(RPCAction.FINALIZE_REQUEST, this.lockService.ensure, this.requestManager.finalizeRequest);

    log.debug("3. Inside ZkKepperController() class");

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
      await this.browserService.openPopup({ params: { redirect: Paths.CREATE_IDENTITY } });
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

      await this.browserService.closePopup();

      return true;
    });

    this.add(RPCAction.LOAD_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.loadOperations);

    this.add(RPCAction.GET_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.getOperations);

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
          await this.browserService.openPopup();
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
            await this.requestManager.newRequest(PendingRequestType.SEMAPHORE_PROOF, {
              ...request,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload: request };
        } finally {
          await this.browserService.closePopup();
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
            await this.requestManager.newRequest(PendingRequestType.RLN_PROOF, {
              ...request,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload: request };
        } finally {
          await this.browserService.closePopup();
        }
      },
    );

    // Injecting
    this.add(RPCAction.TRY_INJECT, async (payload: { origin: string }) => {
      const { origin: host } = payload;
      if (!host) throw new Error("Origin not provided");

      const { isUnlocked } = await this.lockService.getStatus();

      if (!isUnlocked) {
        await this.browserService.openPopup();
        await this.lockService.awaitUnlock();
      }

      const isApproved = this.approvalService.isApproved(host);
      const canSkipApprove = this.approvalService.canSkipApprove(host);

      if (isApproved) return { isApproved, canSkipApprove };

      try {
        await this.requestManager.newRequest(PendingRequestType.INJECT, { origin: host });
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

    this.add(RPCAction.CLOSE_POPUP, async () => this.browserService.closePopup());

    return this;
  };
}
