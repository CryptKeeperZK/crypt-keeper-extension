import { RPCAction } from "@cryptkeeperzk/providers";
import { IRequestHandler } from "@cryptkeeperzk/types";

import { BackupableServices } from "@src/types";

import type { Runtime } from "webextension-polyfill";

import BrowserUtils from "./controllers/browserUtils";
import Handler from "./controllers/handler";
import RequestManager from "./controllers/requestManager";
import ApprovalService from "./services/approval";
import BackupService from "./services/backup";
import VerifiableCredentialsService from "./services/credentials";
import { validateSerializedVerifiableCredential } from "./services/credentials/utils";
import { GroupService } from "./services/group";
import HistoryService from "./services/history";
import InjectorService from "./services/injector";
import LockerService from "./services/lock";
import MiscStorageService from "./services/misc";
import { validateZkInputs } from "./services/validation";
import WalletService from "./services/wallet";
import ZkIdentityService from "./services/zkIdentity";

const defaultMap = Object.values(RPCAction).reduce(
  (acc, method) => ({ ...acc, [method]: false }),
  {},
) as unknown as Record<RPCAction, boolean>;

const RPC_METHOD_ACCESS: Record<RPCAction, boolean> = {
  ...defaultMap,
  [RPCAction.CLOSE_POPUP]: true,
  [RPCAction.CONNECT]: true,
  [RPCAction.APPROVE_HOST]: true,
  [RPCAction.GET_CONNECTED_IDENTITY_DATA]: true,
  [RPCAction.CONNECT_IDENTITY_REQUEST]: true,
  [RPCAction.GET_HOST_PERMISSIONS]: true,
  [RPCAction.SET_HOST_PERMISSIONS]: true,
  [RPCAction.CREATE_IDENTITY_REQUEST]: true,
  [RPCAction.GENERATE_SEMAPHORE_PROOF]: true,
  [RPCAction.GENERATE_RLN_PROOF]: true,
  [RPCAction.ADD_VERIFIABLE_CREDENTIAL_REQUEST]: true,
  [RPCAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT_REQUEST]: true,
  [RPCAction.JOIN_GROUP_REQUEST]: true,
  [RPCAction.GENERATE_GROUP_MEMBERSHIP_PROOF_REQUEST]: true,
};

Object.freeze(RPC_METHOD_ACCESS);

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

  private verifiableCredentialsService: VerifiableCredentialsService;

  private groupService: GroupService;

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
    this.verifiableCredentialsService = VerifiableCredentialsService.getInstance();
    this.verifiableCredentialsService = VerifiableCredentialsService.getInstance();
    this.groupService = GroupService.getInstance();
    this.backupService = BackupService.getInstance()
      .add(BackupableServices.LOCK, this.lockService)
      .add(BackupableServices.WALLET, this.walletService)
      .add(BackupableServices.APPROVAL, this.approvalService)
      .add(BackupableServices.IDENTITY, this.zkIdentityService)
      .add(BackupableServices.VERIFIABLE_CREDENTIALS, this.verifiableCredentialsService);
  }

  handle = (request: IRequestHandler, sender: Runtime.MessageSender): Promise<unknown> =>
    this.handler.handle(request, { sender, bypass: RPC_METHOD_ACCESS[request.method as RPCAction] });

  initialize = (): this => {
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
    this.handler.add(RPCAction.CHECK_PASSWORD, this.lockService.ensure, this.lockService.checkPassword);

    // Identities
    this.handler.add(RPCAction.GET_IDENTITIES, this.lockService.ensure, this.zkIdentityService.getIdentities);
    this.handler.add(
      RPCAction.GET_CONNECTED_IDENTITY_DATA,
      this.lockService.ensure,
      this.zkIdentityService.getConnectedIdentityData,
    );
    this.handler.add(
      RPCAction.GET_CONNECTED_IDENTITY_COMMITMENT,
      this.lockService.ensure,
      this.zkIdentityService.getConnectedIdentityCommitment,
    );
    this.handler.add(RPCAction.CONNECT_IDENTITY, this.lockService.ensure, this.zkIdentityService.connectIdentity);
    this.handler.add(
      RPCAction.CONNECT_IDENTITY_REQUEST,
      this.lockService.ensure,
      this.zkIdentityService.connectIdentityRequest,
    );
    this.handler.add(
      RPCAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT_REQUEST,
      this.lockService.ensure,
      this.zkIdentityService.revealConnectedIdentityCommitmentRequest,
    );
    this.handler.add(
      RPCAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
      this.lockService.ensure,
      this.zkIdentityService.revealConnectedIdentityCommitment,
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

    // Groups
    this.handler.add(RPCAction.JOIN_GROUP, this.lockService.ensure, this.groupService.joinGroup);
    this.handler.add(
      RPCAction.GENERATE_GROUP_MEMBERSHIP_PROOF,
      this.lockService.ensure,
      this.groupService.generateGroupMembershipProof,
    );

    // History
    this.handler.add(RPCAction.GET_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.getOperations);
    this.handler.add(RPCAction.LOAD_IDENTITY_HISTORY, this.lockService.ensure, this.historyService.loadOperations);
    this.handler.add(RPCAction.DELETE_HISTORY_OPERATION, this.lockService.ensure, this.historyService.removeOperation);
    this.handler.add(RPCAction.DELETE_ALL_HISTORY_OPERATIONS, this.lockService.ensure, this.historyService.clear);
    this.handler.add(RPCAction.ENABLE_OPERATION_HISTORY, this.lockService.ensure, this.historyService.enableHistory);

    // Backup
    this.handler.add(RPCAction.DOWNLOAD_BACKUP, this.lockService.ensure, this.backupService.download);
    this.handler.add(
      RPCAction.REQUEST_UPLOAD_BACKUP,
      this.lockService.ensure,
      this.backupService.createUploadBackupRequest,
    );
    this.handler.add(RPCAction.REQUEST_ONBOARDING_BACKUP, this.backupService.createOnboardingBackupRequest);
    this.handler.add(RPCAction.UPLOAD_BACKUP, this.backupService.upload);

    // Wallet
    this.handler.add(RPCAction.GENERATE_MNEMONIC, this.lockService.ensure, this.walletService.generateMnemonic);
    this.handler.add(RPCAction.SAVE_MNEMONIC, this.lockService.ensure, this.walletService.generateKeyPair);
    this.handler.add(RPCAction.GET_ACCOUNTS, this.lockService.ensure, this.walletService.accounts);
    this.handler.add(RPCAction.SELECT_ACCOUNT, this.lockService.ensure, this.walletService.selectAccount);
    this.handler.add(RPCAction.GET_SELECTED_ACCOUNT, this.lockService.ensure, this.walletService.getSelectedAccount);
    this.handler.add(RPCAction.CHECK_MNEMONIC, this.walletService.checkMnemonic);
    this.handler.add(RPCAction.GET_MNEMONIC, this.lockService.ensure, this.walletService.getMnemonic);

    // Credentials
    this.handler.add(
      RPCAction.ADD_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      this.verifiableCredentialsService.addVerifiableCredential,
    );
    this.handler.add(
      RPCAction.ADD_VERIFIABLE_CREDENTIAL_REQUEST,
      this.lockService.ensure,
      validateSerializedVerifiableCredential,
      this.verifiableCredentialsService.addVerifiableCredentialRequest,
    );
    this.handler.add(
      RPCAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
      this.lockService.ensure,
      this.verifiableCredentialsService.rejectVerifiableCredentialRequest,
    );
    this.handler.add(
      RPCAction.RENAME_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      this.verifiableCredentialsService.renameVerifiableCredential,
    );
    this.handler.add(
      RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
      this.lockService.ensure,
      this.verifiableCredentialsService.getAllVerifiableCredentials,
    );
    this.handler.add(
      RPCAction.DELETE_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      this.verifiableCredentialsService.deleteVerifiableCredential,
    );
    this.handler.add(
      RPCAction.DELETE_ALL_VERIFIABLE_CREDENTIALS,
      this.lockService.ensure,
      this.verifiableCredentialsService.deleteAllVerifiableCredentials,
    );

    // Injector
    this.handler.add(RPCAction.CONNECT, this.injectorService.connect);
    this.handler.add(
      RPCAction.GENERATE_SEMAPHORE_PROOF,
      this.lockService.ensure,
      validateZkInputs,
      this.injectorService.generateSemaphoreProof,
    );
    this.handler.add(
      RPCAction.GENERATE_RLN_PROOF,
      this.lockService.ensure,
      validateZkInputs,
      this.injectorService.generateRlnProof,
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
    this.handler.add(RPCAction.CLEAR_STORAGE, this.lockService.ensure, this.browserService.clearStorage);

    return this;
  };
}
