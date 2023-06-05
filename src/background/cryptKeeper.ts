import { RPCAction } from "@src/constants";
import { BackupableServices } from "@src/types";

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

export default class CryptKeeperController extends Handler {
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
    super();
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

  initialize = (): CryptKeeperController => {
    // common
    this.add(
      RPCAction.UNLOCK,
      this.lockService.unlock,
      this.zkIdentityService.unlock,
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

    // lock
    this.add(RPCAction.SETUP_PASSWORD, this.lockService.setupPassword);

    // Identities
    this.add(RPCAction.GET_COMMITMENTS, this.lockService.ensure, this.zkIdentityService.getIdentityCommitments);
    this.add(RPCAction.GET_IDENTITIES, this.lockService.ensure, this.zkIdentityService.getIdentities);
    this.add(RPCAction.GET_HOST_IDENTITIES, this.lockService.ensure, this.zkIdentityService.getHostIdentitis);
    this.add(RPCAction.GET_RANDOM_IDENTITIES, this.lockService.ensure, this.zkIdentityService.getRandomIdentitis);
    // TODO: `RPCAction.GET_ACTIVE_IDENTITY_DATA` should be deprecated and converted to `RPCAction.GET_CONNECTED_IDENTITY_DATA`
    this.add(RPCAction.GET_ACTIVE_IDENTITY_DATA, this.lockService.ensure, this.zkIdentityService.getActiveIdentityData);
    this.add(
      RPCAction.GET_CONNECTED_IDENTITY_DATA,
      this.lockService.ensure,
      this.zkIdentityService.getConnectedIdentityData,
    );
    // TODO: `RPCAction.SET_ACTIVE_IDENTITY` should be deprecated and converted to `RPCAction.SET_CONNECTED_IDENTITY`
    this.add(RPCAction.SET_ACTIVE_IDENTITY, this.lockService.ensure, this.zkIdentityService.setActiveIdentity);
    this.add(RPCAction.SET_CONNECTED_IDENTITY, this.lockService.ensure, this.zkIdentityService.setConnectedIdentity);
    this.add(RPCAction.SET_IDENTITY_NAME, this.lockService.ensure, this.zkIdentityService.updateIdentityName);
    this.add(RPCAction.SET_IDENTITY_HOST, this.lockService.ensure, this.zkIdentityService.setIdentityHost);
    this.add(RPCAction.CREATE_IDENTITY_REQ, this.lockService.ensure, this.zkIdentityService.createIdentityRequest);
    this.add(RPCAction.CREATE_IDENTITY, this.lockService.ensure, this.zkIdentityService.createIdentity);
    this.add(RPCAction.DELETE_IDENTITY, this.lockService.ensure, this.zkIdentityService.deleteIdentity);
    this.add(RPCAction.DELETE_ALL_IDENTITIES, this.lockService.ensure, this.zkIdentityService.deleteAllIdentities);

    // History
    this.add(RPCAction.GET_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.getOperations);
    this.add(RPCAction.LOAD_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.loadOperations);
    this.add(RPCAction.DELETE_HISTORY_OPERATION, this.lockService.ensure, this.historyService.removeOperation);
    this.add(RPCAction.DELETE_ALL_HISTORY_OPERATIONS, this.lockService.ensure, this.historyService.clear);
    this.add(RPCAction.ENABLE_OPERATION_HISTORY, this.lockService.ensure, this.historyService.enableHistory);

    // Backup
    this.add(RPCAction.DOWNLOAD_BACKUP, this.lockService.ensure, this.backupService.download);
    this.add(RPCAction.UPLOAD_BACKUP, this.backupService.upload);

    // Wallet
    this.add(RPCAction.GENERATE_MNEMONIC, this.lockService.ensure, this.walletService.generateMnemonic);
    this.add(RPCAction.SAVE_MNEMONIC, this.lockService.ensure, this.walletService.generateKeyPair);
    this.add(RPCAction.GET_ACCOUNTS, this.lockService.ensure, this.walletService.accounts);
    this.add(RPCAction.SELECT_ACCOUNT, this.lockService.ensure, this.walletService.selectAccount);
    this.add(RPCAction.GET_SELECTED_ACCOUNT, this.lockService.ensure, this.walletService.getSelectedAccount);

    // Injector
    this.add(RPCAction.CONNECT, this.injectorService.connect);
    this.add(
      RPCAction.PREPARE_RLN_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      this.injectorService.prepareRLNProofRequest,
    );
    this.add(
      RPCAction.PREPARE_SEMAPHORE_PROOF_REQUEST,
      this.lockService.ensure,
      validateZkInputs,
      this.injectorService.prepareSemaphoreProofRequest,
    );

    // Approvals
    // TODO: this approvalApi is now not exposed through RPC calls, but only used in the connection part through the injector service `this.injectorService.connect.connect()
    // this.add(RPCAction.APPROVE_HOST, this.lockService.ensure, this.approvalService.add);
    this.add(RPCAction.IS_HOST_APPROVED, this.lockService.ensure, this.approvalService.isApproved);
    this.add(RPCAction.REMOVE_HOST, this.lockService.ensure, this.approvalService.remove);
    this.add(RPCAction.GET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.getPermission);
    this.add(RPCAction.SET_HOST_PERMISSIONS, this.lockService.ensure, this.approvalService.setPermission);
    // Approvals - DEV ONLY
    this.add(RPCAction.CLEAR_APPROVED_HOSTS, this.approvalService.clear);

    // Misc
    this.add(
      RPCAction.SET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.setExternalWalletConnection,
    );
    this.add(
      RPCAction.GET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.getExternalWalletConnection,
    );

    // Browser
    this.add(RPCAction.CLOSE_POPUP, async () => this.browserService.closePopup());

    return this;
  };
}
