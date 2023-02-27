import RPCAction from "@src/util/constants";
import { PendingRequestType, NewIdentityRequest, IdentityName } from "@src/types";
import { bigintToHex } from "bigint-conversion";
import Handler from "./controllers/handler";
import LockService from "./services/lock";
import IdentityService from "./services/identity";
import ZkValidator from "./services/zk-validator";
import RequestManager from "./controllers/request-manager";
import { RLNProofRequest, SemaphoreProofRequest } from "./services/protocols/interfaces";
import ApprovalService from "./services/approval";
import ZkIdentityWrapper from "./identity-decorater";
import identityFactory from "./identity-factory";
import BrowserUtils from "./controllers/browser-utils";
import log from "loglevel";
import { browser } from "webextension-polyfill-ts";

export default class ZkKeeperController extends Handler {
  private identityService: IdentityService;
  private zkValidator: ZkValidator;
  private requestManager: RequestManager;
  private approvalService: ApprovalService;

  constructor() {
    super();
    this.identityService = new IdentityService();
    this.zkValidator = new ZkValidator();
    this.requestManager = new RequestManager();
    this.approvalService = new ApprovalService();
    log.debug("Inside ZkKepperController");
  }

  initialize = async (): Promise<ZkKeeperController> => {
    // common
    this.add(
      RPCAction.UNLOCK,
      LockService.unlock,
      //this.metamaskServiceEthers.ensure,
      this.identityService.unlock,
      this.approvalService.unlock,
      LockService.onUnlocked,
    );

    this.add(RPCAction.LOCK, LockService.logout);

    /**
     *  Return status of background process
     *  @returns {Object} status Background process status
     *  @returns {boolean} status.initialized has background process been initialized
     *  @returns {boolean} status.unlocked is background process unlocked
     */
    this.add(RPCAction.GET_STATUS, async () => {
      const { initialized, unlocked } = await LockService.getStatus();
      return {
        initialized,
        unlocked,
      };
    });

    // requests
    this.add(RPCAction.GET_PENDING_REQUESTS, LockService.ensure, this.requestManager.getRequests);
    this.add(RPCAction.FINALIZE_REQUEST, LockService.ensure, this.requestManager.finalizeRequest);

    log.debug("3. Inside ZkKepperController() class");
    // web3
    //this.add(RPCAction.CONNECT_METAMASK, LockService.ensure, this.metamaskServiceEthers.connectMetamask)
    //this.add(RPCAction.GET_WALLET_INFO, this.metamaskServiceEthers.getWalletInfo)

    // lock
    this.add(RPCAction.SETUP_PASSWORD, (payload: string) => LockService.setupPassword(payload));

    // identites
    this.add(RPCAction.CREATE_IDENTITY, LockService.ensure, async (payload: NewIdentityRequest) => {
      try {
        const { strategy, messageSignature, options } = payload;
        if (!strategy) throw new Error("strategy not provided");

        const numOfIdentites = await this.identityService.getNumOfIdentites();
        const config: any = {
          ...options,
          name: options?.name || `Account # ${numOfIdentites}`,
        };

        if (strategy === "interrep") {
          log.debug("CREATE_IDENTITY: 1");
          config.messageSignature = messageSignature;
          log.debug("CREATE_IDENTITY: 2");
        }

        const identity: ZkIdentityWrapper | undefined = await identityFactory(strategy, config);
        log.debug("CREATE_IDENTITY: 4", identity);

        if (!identity) {
          throw new Error("Identity not created, make sure to check strategy");
        }

        await this.identityService.insert(identity);

        return true;
      } catch (error: any) {
        log.debug("CREATE_IDENTITY: Error", error);
        throw new Error(error.message);
      }
    });

    this.add(RPCAction.GET_COMMITMENTS, LockService.ensure, this.identityService.getIdentityCommitments);
    this.add(RPCAction.GET_IDENTITIES, LockService.ensure, this.identityService.getIdentities);
    this.add(RPCAction.SET_ACTIVE_IDENTITY, LockService.ensure, this.identityService.setActiveIdentity);
    this.add(
      RPCAction.SET_IDENTITY_NAME,
      LockService.ensure,
      async (payload: IdentityName) => await this.identityService.setIdentityName(payload),
    );
    this.add(
      RPCAction.DELETE_IDENTITY,
      LockService.ensure,
      async (payload: IdentityName) => await this.identityService.deleteIdentity(payload),
    );
    this.add(RPCAction.GET_ACTIVE_IDENTITY, LockService.ensure, async () => {
      const identity = await this.identityService.getActiveIdentity();

      return identity ? bigintToHex(identity.genIdentityCommitment()) : null;
    });

    // protocols
    this.add(
      RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      LockService.ensure,
      this.zkValidator.validateZkInputs,
      async (payload: SemaphoreProofRequest, meta: any) => {
        const { unlocked } = await LockService.getStatus();

        const semaphorePath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/semaphore/semaphore.json"),
        };

        if (!unlocked) {
          await BrowserUtils.openPopup();
          await LockService.awaitUnlock();
        }

        const identity = await this.identityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = await this.approvalService.getPermission(meta.origin);

        if (!identity) throw new Error("active identity not found");
        if (!approved) throw new Error(`${meta.origin} is not approved`);

        try {
          payload = {
            ...payload,
            circuitFilePath: semaphorePath.circuitFilePath,
            zkeyFilePath: semaphorePath.zkeyFilePath,
            verificationKey: semaphorePath.verificationKey,
          };

          if (!permission.noApproval) {
            await this.requestManager.newRequest(PendingRequestType.SEMAPHORE_PROOF, {
              ...payload,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload };
        } catch (err) {
          throw err;
        } finally {
          await BrowserUtils.closePopup();
        }
      },
    );

    this.add(
      RPCAction.PREPARE_RLN_PROOF_REQUEST,
      LockService.ensure,
      this.zkValidator.validateZkInputs,
      async (payload: RLNProofRequest, meta: any) => {
        const identity = await this.identityService.getActiveIdentity();
        const approved = this.approvalService.isApproved(meta.origin);
        const permission = await this.approvalService.getPermission(meta.origin);

        const rlnPath = {
          circuitFilePath: browser.runtime.getURL("js/zkeyFiles//rln/rln.wasm"),
          zkeyFilePath: browser.runtime.getURL("js/zkeyFiles/rln/rln.zkey"),
          verificationKey: browser.runtime.getURL("js/zkeyFiles/rln/rln.json"),
        };

        if (!identity) throw new Error("active identity not found");
        if (!approved) throw new Error(`${meta.origin} is not approved`);

        try {
          payload = {
            ...payload,
            circuitFilePath: rlnPath.circuitFilePath,
            zkeyFilePath: rlnPath.zkeyFilePath,
            verificationKey: rlnPath.verificationKey,
          };

          if (!permission.noApproval) {
            await this.requestManager.newRequest(PendingRequestType.RLN_PROOF, {
              ...payload,
              origin: meta.origin,
            });
          }

          return { identity: identity.serialize(), payload };
        } catch (err) {
          throw err;
        } finally {
          await BrowserUtils.closePopup();
        }
      },
    );

    // injecting
    this.add(RPCAction.TRY_INJECT, async (payload: any) => {
      const { origin }: { origin: string } = payload;
      if (!origin) throw new Error("Origin not provided");

      const { unlocked } = await LockService.getStatus();

      if (!unlocked) {
        await BrowserUtils.openPopup();
        await LockService.awaitUnlock();
      }

      const isApproved = this.approvalService.isApproved(origin);

      if (isApproved) return true;

      try {
        await this.requestManager.newRequest(PendingRequestType.INJECT, { origin });
        return true;
      } catch (e) {
        log.error(e);
        return false;
      }
    });
    this.add(RPCAction.APPROVE_HOST, LockService.ensure, async (payload: any) => {
      this.approvalService.add(payload);
    });
    this.add(RPCAction.IS_HOST_APPROVED, LockService.ensure, this.approvalService.isApproved);
    this.add(RPCAction.REMOVE_HOST, LockService.ensure, this.approvalService.remove);

    this.add(RPCAction.GET_HOST_PERMISSIONS, LockService.ensure, async (payload: any) =>
      this.approvalService.getPermission(payload),
    );

    this.add(RPCAction.SET_HOST_PERMISSIONS, LockService.ensure, async (payload: any) => {
      const { host, ...permissions } = payload;
      return this.approvalService.setPermission(host, permissions);
    });

    this.add(RPCAction.CLOSE_POPUP, async () => BrowserUtils.closePopup());

    // this.add(RPCAction.CREATE_IDENTITY_REQ, LockService.ensure, this.metamaskServiceEthers.ensure, async () => {
    //     const res: any = await this.requestManager.newRequest(PendingRequestType.CREATE_IDENTITY, { origin })

    //     const { provider, options } = res

    //     return this.handle({
    //         method: RPCAction.CREATE_IDENTITY,
    //         payload: {
    //             strategy: provider,
    //             options
    //         }
    //     })
    // })

    // dev
    this.add(RPCAction.CLEAR_APPROVED_HOSTS, this.approvalService.empty);
    this.add(RPCAction.DUMMY_REQUEST, async () =>
      this.requestManager.newRequest(PendingRequestType.DUMMY, "hello from dummy"),
    );

    return this;
  };
}
