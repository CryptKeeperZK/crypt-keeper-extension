import { RPCAction } from "@cryptkeeperzk/providers";

import { BackupableServices, RequestHandler } from "@src/types";

import BrowserUtils from "./controllers/browserUtils";
import Handler from "./controllers/handler";
import RequestManager from "./controllers/requestManager";
import ApprovalService from "./services/approval";
import BackupService from "./services/backup";
import HistoryService from "./services/history";
import InjectorService from "./services/injector";
import LockerService from "./services/lock";
import MiscStorageService from "./services/misc";
import { validateZkInputs } from "./services/validation";
import WalletService from "./services/wallet";
import ZkIdentityService from "./services/zkIdentity";

export default class CryptKeeperController {
  private handler: Handler;

  private zkIdentityService: ZkIdentityService;

  private requestManager: RequestManager;

  private approvalService: ApprovalService;

  private miscStorageService: MiscStorageService;

  private lockService: LockerService;

  private injectorService: InjectorService;

  private browserService: BrowserUtils;

  private historyService: HistoryService;

  private backupService: BackupService;

  private walletService: WalletService;

  constructor() {
    this.handler = new Handler();
    this.requestManager = RequestManager.getInstance();
    this.zkIdentityService = ZkIdentityService.getInstance();
    this.approvalService = ApprovalService.getInstance();
    this.miscStorageService = MiscStorageService.getInstance();
    this.lockService = LockerService.getInstance();
    this.injectorService = InjectorService.getInstance();
    this.browserService = BrowserUtils.getInstance();
    this.historyService = HistoryService.getInstance();
    this.walletService = WalletService.getInstance();
    this.backupService = BackupService.getInstance()
      .add(BackupableServices.APPROVAL, this.approvalService)
      .add(BackupableServices.IDENTITY, this.zkIdentityService)
      .add(BackupableServices.LOCK, this.lockService)
      .add(BackupableServices.WALLET, this.walletService);
  }

  handle = (request: RequestHandler): Promise<unknown> => this.handler.handle(request);

  initialize = (): CryptKeeperController => {
    // common
    this.handler.add(
      RPCAction.UNLOCK,
      this.lockService.unlock,
      this.zkIdentityService.unlock,
      this.approvalService.unlock,
      this.lockService.onUnlocked,
    );

    this.handler.add(RPCAction.LOCK, this.lockService.logout);

    /**
     *  Return status of background process
     *  @returns {Object} status Background process status
     *  @returns {boolean} status.isInitialized has background process been initialized
     *  @returns {boolean} status.isUnlocked is background process unlocked
     */
    this.handler.add(RPCAction.GET_STATUS, this.lockService.getStatus);

    // requests
    this.handler.add(RPCAction.GET_PENDING_REQUESTS, this.lockService.ensure, this.requestManager.getRequests);
    this.handler.add(RPCAction.FINALIZE_REQUEST, this.lockService.ensure, this.requestManager.finalizeRequest);

    // lock
    this.handler.add(RPCAction.SETUP_PASSWORD, this.lockService.setupPassword);
    this.handler.add(RPCAction.RESET_PASSWORD, this.lockService.resetPassword);

    // Identities
    this.handler.add(RPCAction.GET_COMMITMENTS, this.lockService.ensure, this.zkIdentityService.getIdentityCommitments);
    this.handler.add(RPCAction.GET_IDENTITIES, this.lockService.ensure, this.zkIdentityService.getIdentities);
    this.handler.add(
      RPCAction.GET_CONNECTED_IDENTITY_DATA,
      this.lockService.ensure,
      this.zkIdentityService.getConnectedIdentityData,
    );
    this.handler.add(RPCAction.CONNECT_IDENTITY, this.lockService.ensure, this.zkIdentityService.connectIdentity);
    this.handler.add(
      RPCAction.CONNECT_IDENTITY_REQUEST,
      this.lockService.ensure,
      this.zkIdentityService.connectIdentityRequest,
    );
    this.handler.add(RPCAction.SET_IDENTITY_NAME, this.lockService.ensure, this.zkIdentityService.setIdentityName);
    this.handler.add(RPCAction.SET_IDENTITY_HOST, this.lockService.ensure, this.zkIdentityService.setIdentityHost);
    this.handler.add(
      RPCAction.CREATE_IDENTITY_REQUEST,
      this.lockService.ensure,
      this.zkIdentityService.createIdentityRequest,
    );
    this.handler.add(RPCAction.CREATE_IDENTITY, this.lockService.ensure, this.zkIdentityService.createIdentity);
    this.handler.add(RPCAction.DELETE_IDENTITY, this.lockService.ensure, this.zkIdentityService.deleteIdentity);
    this.handler.add(
      RPCAction.DELETE_ALL_IDENTITIES,
      this.lockService.ensure,
      this.zkIdentityService.deleteAllIdentities,
    );

    // History
    this.handler.add(RPCAction.GET_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.getOperations);
    this.handler.add(RPCAction.LOAD_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.loadOperations);
    this.handler.add(RPCAction.DELETE_HISTORY_OPERATION, this.lockService.ensure, this.historyService.removeOperation);
    this.handler.add(RPCAction.DELETE_ALL_HISTORY_OPERATIONS, this.lockService.ensure, this.historyService.clear);
    this.handler.add(RPCAction.ENABLE_OPERATION_HISTORY, this.lockService.ensure, this.historyService.enableHistory);

    // Backup
    this.handler.add(RPCAction.DOWNLOAD_BACKUP, this.lockService.ensure, this.backupService.download);
    this.handler.add(RPCAction.UPLOAD_BACKUP, this.backupService.upload);

    // Wallet
    this.handler.add(RPCAction.GENERATE_MNEMONIC, this.lockService.ensure, this.walletService.generateMnemonic);
    this.handler.add(RPCAction.SAVE_MNEMONIC, this.lockService.ensure, this.walletService.generateKeyPair);
    this.handler.add(RPCAction.GET_ACCOUNTS, this.lockService.ensure, this.walletService.accounts);
    this.handler.add(RPCAction.SELECT_ACCOUNT, this.lockService.ensure, this.walletService.selectAccount);
    this.handler.add(RPCAction.GET_SELECTED_ACCOUNT, this.lockService.ensure, this.walletService.getSelectedAccount);
    this.handler.add(RPCAction.CHECK_MNEMONIC, this.walletService.checkMnemonic);

    // Injector
    this.handler.add(RPCAction.CONNECT, this.injectorService.connect);
    this.handler.add(
      RPCAction.PREPARE_RLN_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      this.injectorService.prepareRlnProofRequest,
    );
    this.handler.add(
      RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      this.injectorService.prepareSemaphoreProofRequest,
    );

    // Approvals
    this.handler.add(RPCAction.APPROVE_HOST, this.lockService.ensure, this.approvalService.add);
    this.handler.add(RPCAction.IS_HOST_APPROVED, this.lockService.ensure, this.approvalService.isApproved);
    this.handler.add(RPCAction.REMOVE_HOST, this.lockService.ensure, this.approvalService.remove);
    this.handler.add(RPCAction.GET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.getPermission);
    this.handler.add(RPCAction.SET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.setPermission);
    // Approvals - DEV ONLY
    this.handler.add(RPCAction.CLEAR_APPROVED_HOSTS, this.approvalService.clear);

    // Misc
    this.handler.add(
      RPCAction.SET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.setExternalWalletConnection,
    );
    this.handler.add(
      RPCAction.GET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.getExternalWalletConnection,
    );

    // Browser
    this.handler.add(RPCAction.CLOSE_POPUP, this.browserService.closePopup);

    return this;
  };
}
