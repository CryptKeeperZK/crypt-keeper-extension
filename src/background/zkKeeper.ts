import { bigintToHex } from "bigint-conversion";
import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

import { RPCAction } from "@src/constants";
import { PendingRequestType, NewIdentityRequest, IdentityName } from "@src/types";

import BrowserUtils from "./controllers/browserUtils";
import Handler from "./controllers/handler";
import RequestManager from "./controllers/requestManager";
import identityFactory from "./identityFactory";
import ApprovalService from "./services/approval";
import IdentityService from "./services/identity";
import LockService from "./services/lock";
import { RLNProofRequest, SemaphoreProofRequest } from "./services/protocols/interfaces";
import WalletService from "./services/wallet";
import ZkValidator from "./services/zkValidator";

export default class ZkKeeperController extends Handler {
  private identityService: IdentityService;

  private zkValidator: ZkValidator;

  private requestManager: RequestManager;

  private approvalService: ApprovalService;

  private walletService: WalletService;

  private lockService: LockService;

  public constructor() {
    super();
    this.identityService = new IdentityService();
    this.zkValidator = new ZkValidator();
    this.requestManager = new RequestManager();
    this.approvalService = new ApprovalService();
    this.walletService = new WalletService();
    this.lockService = LockService.getInstance();
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
     *  @returns {boolean} status.initialized has background process been initialized
     *  @returns {boolean} status.unlocked is background process unlocked
     */
    this.add(RPCAction.GET_STATUS, async () => {
      const { initialized, unlocked } = await this.lockService.getStatus();
      return {
        initialized,
        unlocked,
      };
    });

    // requests
    this.add(RPCAction.GET_PENDING_REQUESTS, this.lockService.ensure, this.requestManager.getRequests);
    this.add(RPCAction.FINALIZE_REQUEST, this.lockService.ensure, this.requestManager.finalizeRequest);

    log.debug("3. Inside ZkKepperController() class");

    // lock
    this.add(RPCAction.SETUP_PASSWORD, (payload: string) => this.lockService.setupPassword(payload));

    // identites
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

      return true;
    });

    this.add(RPCAction.GET_COMMITMENTS, this.lockService.ensure, this.identityService.getIdentityCommitments);
    this.add(RPCAction.GET_IDENTITIES, this.lockService.ensure, this.identityService.getIdentities);
    this.add(RPCAction.SET_ACTIVE_IDENTITY, this.lockService.ensure, this.identityService.setActiveIdentity);
    this.add(RPCAction.SET_IDENTITY_NAME, this.lockService.ensure, async (payload: IdentityName) =>
      this.identityService.setIdentityName(payload),
    );

    this.add(RPCAction.DELETE_IDENTITY, this.lockService.ensure, async (payload: IdentityName) =>
      this.identityService.deleteIdentity(payload),
    );

    this.add(RPCAction.DELETE_ALL_IDENTITIES, this.lockService.ensure, this.identityService.deleteAllIdentities);

    this.add(RPCAction.GET_ACTIVE_IDENTITY, this.lockService.ensure, async () => {
      const identity = await this.identityService.getActiveIdentity();

      return identity ? bigintToHex(identity.genIdentityCommitment()) : null;
    });

    // protocols
    this.add(
      RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      this.lockService.ensure,
      this.zkValidator.validateZkInputs,
      async (payload: SemaphoreProofRequest, meta: { origin: string }) => {
        const { unlocked } = await this.lockService.getStatus();

        const semaphorePath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
        };

        if (!unlocked) {
          await BrowserUtils.openPopup();
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
          await BrowserUtils.closePopup();
        }
      },
    );

    this.add(
      RPCAction.PREPARE_RLN_PROOF_REQUEST,
      this.lockService.ensure,
      this.zkValidator.validateZkInputs,
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
          await BrowserUtils.closePopup();
        }
      },
    );

    // injecting
    this.add(RPCAction.TRY_INJECT, async (payload: { origin: string }) => {
      const { origin: host } = payload;
      if (!host) throw new Error("Origin not provided");

      const { unlocked } = await this.lockService.getStatus();

      if (!unlocked) {
        await BrowserUtils.openPopup();
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
    this.add(RPCAction.APPROVE_HOST, this.lockService.ensure, (payload: { host: string; noApproval: boolean }) => {
      this.approvalService.add(payload);
    });
    this.add(RPCAction.IS_HOST_APPROVED, this.lockService.ensure, this.approvalService.isApproved);
    this.add(RPCAction.REMOVE_HOST, this.lockService.ensure, this.approvalService.remove);

    this.add(RPCAction.GET_HOST_PERMISSIONS, this.lockService.ensure, (payload: string) =>
      this.approvalService.getPermission(payload),
    );

    this.add(
      RPCAction.SET_HOST_PERMISSIONS,
      this.lockService.ensure,
      (payload: { host: string; noApproval: boolean }) => {
        const { host, ...permissions } = payload;
        return this.approvalService.setPermission(host, permissions);
      },
    );

    this.add(RPCAction.CLOSE_POPUP, async () => BrowserUtils.closePopup());

    this.add(RPCAction.GET_CONNECT_WALLET_MODAL, this.lockService.ensure, async () => {
      try {
        await this.requestManager.newRequest(PendingRequestType.CONNECT_WALLET);
        return true;
      } catch (e) {
        log.error(e);
        return false;
      }
    });

    this.add(RPCAction.SET_CONNECT_WALLET, this.lockService.ensure, this.walletService.setConnection);

    this.add(RPCAction.GET_CONNECT_WALLET, this.lockService.ensure, this.walletService.getConnection);

    // dev
    this.add(RPCAction.CLEAR_APPROVED_HOSTS, this.approvalService.clear);

    return this;
  };
}
