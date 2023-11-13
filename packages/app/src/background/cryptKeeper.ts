import { RPCExternalAction } from "@cryptkeeperzk/providers";
import { IRequestHandler } from "@cryptkeeperzk/types";

import BrowserUtils from "@src/background/controllers/browserUtils";
import Handler from "@src/background/controllers/handler";
import RequestManager from "@src/background/controllers/requestManager";
import ApprovalService from "@src/background/services/approval";
import BackupService from "@src/background/services/backup";
import ConnectionService from "@src/background/services/connection";
import VerifiableCredentialsService from "@src/background/services/credentials";
import GroupService from "@src/background/services/group";
import HistoryService from "@src/background/services/history";
import { InjectorService } from "@src/background/services/injector";
import LockerService from "@src/background/services/lock";
import MiscStorageService from "@src/background/services/misc";
import ProtocolService from "@src/background/services/protocol";
import WalletService from "@src/background/services/wallet";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { RPCInternalAction } from "@src/constants";
import { BackupableServices } from "@src/types";
import { validateSerializedVerifiableCredential } from "@src/util/credentials";

import type { Runtime } from "webextension-polyfill";

const defaultMap = Object.values(RPCExternalAction).reduce(
  (acc, method) => ({ ...acc, [method]: false }),
  {},
) as unknown as Record<RPCExternalAction, boolean>;

const RPC_METHOD_ACCESS: Record<RPCExternalAction, boolean> = {
  ...defaultMap,
  [RPCExternalAction.GET_CONNECTED_IDENTITY_DATA]: true,
  [RPCExternalAction.CONNECT]: true,
  [RPCExternalAction.GENERATE_SEMAPHORE_PROOF]: true,
  [RPCExternalAction.GENERATE_RLN_PROOF]: true,
  [RPCExternalAction.JOIN_GROUP]: true,
  [RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF]: true,
  [RPCExternalAction.IMPORT_IDENTITY]: true,
  [RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT]: true,
  // TODO: Please note that the following 2 actions will be refactored in another PR
  [RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL]: true,
  [RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION]: true,
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

  private protocolService: ProtocolService;

  private connectionService: ConnectionService;

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
    this.protocolService = ProtocolService.getInstance();
    this.connectionService = ConnectionService.getInstance();
    this.backupService = BackupService.getInstance()
      .add(BackupableServices.LOCK, this.lockService)
      .add(BackupableServices.WALLET, this.walletService)
      .add(BackupableServices.APPROVAL, this.approvalService)
      .add(BackupableServices.IDENTITY, this.zkIdentityService)
      .add(BackupableServices.VERIFIABLE_CREDENTIALS, this.verifiableCredentialsService)
      .add(BackupableServices.CONNECTIONS, this.connectionService);
  }

  handle = (request: IRequestHandler, sender: Runtime.MessageSender): Promise<unknown> =>
    this.handler.handle(request, { sender, bypass: RPC_METHOD_ACCESS[request.method as RPCExternalAction] });

  initialize = (): this => {
    // Handling RPC EXTERNAL ACTIONS
    this.handler.add(RPCExternalAction.GET_CONNECTED_IDENTITY_DATA, this.injectorService.getConnectedIdentityMetadata);
    this.handler.add(RPCExternalAction.CONNECT, this.injectorService.connect);
    this.handler.add(
      RPCExternalAction.GENERATE_SEMAPHORE_PROOF,
      this.lockService.ensure,
      this.approvalService.isOriginApproved,
      this.connectionService.isOriginConnected,
      this.protocolService.generateSemaphoreProof,
    );
    this.handler.add(
      RPCExternalAction.GENERATE_RLN_PROOF,
      this.lockService.ensure,
      this.approvalService.isOriginApproved,
      this.connectionService.isOriginConnected,
      this.protocolService.generateRLNProof,
    );
    this.handler.add(
      RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
      this.lockService.ensure,
      this.approvalService.isOriginApproved,
      this.connectionService.isOriginConnected,
      this.connectionService.revealConnectedIdentityCommitmentRequest,
    );
    this.handler.add(
      RPCExternalAction.JOIN_GROUP,
      this.lockService.ensure,
      this.approvalService.isOriginApproved,
      this.connectionService.isOriginConnected,
      this.groupService.joinGroupRequest,
    );
    this.handler.add(
      RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF,
      this.lockService.ensure,
      this.approvalService.isOriginApproved,
      this.connectionService.isOriginConnected,
      this.groupService.generateGroupMerkleProofRequest,
    );
    this.handler.add(
      RPCExternalAction.IMPORT_IDENTITY,
      this.lockService.ensure,
      this.approvalService.isOriginApproved,
      this.connectionService.isOriginConnected,
      this.zkIdentityService.importRequest,
    );

    // Handling RPC INTERNAL ACTIONS
    // common
    this.handler.add(
      RPCInternalAction.UNLOCK,
      this.lockService.unlock,
      this.approvalService.unlock,
      this.zkIdentityService.unlock,
      this.connectionService.unlock,
      this.lockService.onUnlocked,
      this.approvalService.onUnlocked,
      this.zkIdentityService.onUnlocked,
      this.connectionService.onUnlocked,
    );
    this.handler.add(
      RPCInternalAction.LOCK,
      this.lockService.lock,
      this.zkIdentityService.lock,
      this.approvalService.lock,
    );
    this.handler.add(RPCInternalAction.GET_STATUS, this.lockService.getStatus);

    // Requests
    this.handler.add(RPCInternalAction.GET_PENDING_REQUESTS, this.requestManager.getRequests);
    this.handler.add(RPCInternalAction.FINALIZE_REQUEST, this.requestManager.finalizeRequest);

    // Lock
    this.handler.add(RPCInternalAction.SETUP_PASSWORD, this.lockService.setupPassword);
    this.handler.add(RPCInternalAction.RESET_PASSWORD, this.lockService.resetPassword);
    this.handler.add(RPCInternalAction.CHECK_PASSWORD, this.lockService.ensure, this.lockService.checkPassword);

    // Connections
    this.handler.add(RPCInternalAction.CONNECT, this.lockService.ensure, this.connectionService.connect);
    this.handler.add(RPCInternalAction.DISCONNECT, this.lockService.ensure, this.connectionService.disconnect);
    this.handler.add(
      RPCInternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
      this.lockService.ensure,
      this.connectionService.revealConnectedIdentityCommitment,
    );
    this.handler.add(RPCInternalAction.GET_CONNECTIONS, this.lockService.ensure, this.connectionService.getConnections);

    // Identities
    this.handler.add(RPCInternalAction.GET_IDENTITIES, this.lockService.ensure, this.zkIdentityService.getIdentities);
    this.handler.add(RPCInternalAction.IMPORT_IDENTITY, this.lockService.ensure, this.zkIdentityService.import);
    this.handler.add(
      RPCInternalAction.SET_IDENTITY_NAME,
      this.lockService.ensure,
      this.zkIdentityService.setIdentityName,
    );
    this.handler.add(
      RPCInternalAction.CREATE_IDENTITY_REQUEST,
      this.lockService.ensure,
      this.zkIdentityService.createIdentityRequest,
    );
    this.handler.add(RPCInternalAction.CREATE_IDENTITY, this.lockService.ensure, this.zkIdentityService.createIdentity);
    this.handler.add(
      RPCInternalAction.DELETE_IDENTITY,
      this.lockService.ensure,
      this.zkIdentityService.deleteIdentity,
      this.connectionService.disconnect,
    );
    this.handler.add(
      RPCInternalAction.DELETE_ALL_IDENTITIES,
      this.lockService.ensure,
      this.connectionService.clear,
      this.zkIdentityService.deleteAllIdentities,
    );

    // Groups
    this.handler.add(RPCInternalAction.JOIN_GROUP, this.lockService.ensure, this.groupService.joinGroup);
    this.handler.add(
      RPCInternalAction.GENERATE_GROUP_MERKLE_PROOF,
      this.lockService.ensure,
      this.groupService.generateGroupMerkleProof,
    );
    this.handler.add(
      RPCInternalAction.CHECK_GROUP_MEMBERSHIP,
      this.lockService.ensure,
      this.groupService.checkGroupMembership,
    );

    // History
    this.handler.add(
      RPCInternalAction.GET_IDENTITY_HISTORY,
      this.lockService.ensure,
      this.historyService.getOperations,
    );
    this.handler.add(
      RPCInternalAction.LOAD_IDENTITY_HISTORY,
      this.lockService.ensure,
      this.historyService.loadOperations,
    );
    this.handler.add(
      RPCInternalAction.DELETE_HISTORY_OPERATION,
      this.lockService.ensure,
      this.historyService.removeOperation,
    );
    this.handler.add(
      RPCInternalAction.DELETE_ALL_HISTORY_OPERATIONS,
      this.lockService.ensure,
      this.historyService.clear,
    );
    this.handler.add(
      RPCInternalAction.ENABLE_OPERATION_HISTORY,
      this.lockService.ensure,
      this.historyService.enableHistory,
    );

    // Backup
    this.handler.add(RPCInternalAction.DOWNLOAD_BACKUP, this.lockService.ensure, this.backupService.download);
    this.handler.add(
      RPCInternalAction.REQUEST_UPLOAD_BACKUP,
      this.lockService.ensure,
      this.backupService.createUploadBackupRequest,
    );
    this.handler.add(RPCInternalAction.REQUEST_ONBOARDING_BACKUP, this.backupService.createOnboardingBackupRequest);
    this.handler.add(RPCInternalAction.UPLOAD_BACKUP, this.backupService.upload);

    // Wallet
    this.handler.add(RPCInternalAction.GENERATE_MNEMONIC, this.lockService.ensure, this.walletService.generateMnemonic);
    this.handler.add(RPCInternalAction.SAVE_MNEMONIC, this.lockService.ensure, this.walletService.generateKeyPair);
    this.handler.add(RPCInternalAction.GET_ACCOUNTS, this.lockService.ensure, this.walletService.accounts);
    this.handler.add(RPCInternalAction.SELECT_ACCOUNT, this.lockService.ensure, this.walletService.selectAccount);
    this.handler.add(
      RPCInternalAction.GET_SELECTED_ACCOUNT,
      this.lockService.ensure,
      this.walletService.getSelectedAccount,
    );
    this.handler.add(RPCInternalAction.CHECK_MNEMONIC, this.walletService.checkMnemonic);
    this.handler.add(RPCInternalAction.GET_MNEMONIC, this.lockService.ensure, this.walletService.getMnemonic);

    // Credentials
    this.handler.add(
      RPCInternalAction.ADD_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      this.verifiableCredentialsService.addVerifiableCredential,
    );
    this.handler.add(
      RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      validateSerializedVerifiableCredential,
      this.verifiableCredentialsService.addVerifiableCredentialRequest,
    );
    this.handler.add(
      RPCInternalAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
      this.lockService.ensure,
      this.verifiableCredentialsService.rejectVerifiableCredentialRequest,
    );
    this.handler.add(
      RPCInternalAction.RENAME_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      this.verifiableCredentialsService.renameVerifiableCredential,
    );
    this.handler.add(
      RPCInternalAction.GET_ALL_VERIFIABLE_CREDENTIALS,
      this.lockService.ensure,
      this.verifiableCredentialsService.getAllVerifiableCredentials,
    );
    this.handler.add(
      RPCInternalAction.DELETE_VERIFIABLE_CREDENTIAL,
      this.lockService.ensure,
      this.verifiableCredentialsService.deleteVerifiableCredential,
    );
    this.handler.add(
      RPCInternalAction.DELETE_ALL_VERIFIABLE_CREDENTIALS,
      this.lockService.ensure,
      this.verifiableCredentialsService.deleteAllVerifiableCredentials,
    );
    this.handler.add(
      RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      this.lockService.ensure,
      this.verifiableCredentialsService.generateVerifiablePresentation,
    );
    this.handler.add(
      RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION_WITH_CRYPTKEEPER,
      this.lockService.ensure,
      this.verifiableCredentialsService.generateVerifiablePresentationWithCryptkeeper,
    );
    this.handler.add(
      RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      this.lockService.ensure,
      this.verifiableCredentialsService.generateVerifiablePresentationRequest,
    );
    this.handler.add(
      RPCInternalAction.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
      this.lockService.ensure,
      this.verifiableCredentialsService.rejectVerifiablePresentationRequest,
    );

    // Approvals
    this.handler.add(RPCInternalAction.APPROVE_HOST, this.lockService.ensure, this.approvalService.add);
    this.handler.add(RPCInternalAction.IS_HOST_APPROVED, this.lockService.ensure, this.approvalService.isApproved);
    this.handler.add(RPCInternalAction.REMOVE_HOST, this.lockService.ensure, this.approvalService.remove);
    this.handler.add(
      RPCInternalAction.GET_HOST_PERMISSIONS,
      this.lockService.ensure,
      this.approvalService.getPermission,
    );
    this.handler.add(
      RPCInternalAction.SET_HOST_PERMISSIONS,
      this.lockService.ensure,
      this.approvalService.setPermission,
    );
    // Approvals - DEV ONLY
    this.handler.add(RPCInternalAction.CLEAR_APPROVED_HOSTS, this.approvalService.clear);

    // Misc
    this.handler.add(
      RPCInternalAction.SET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.setExternalWalletConnection,
    );
    this.handler.add(
      RPCInternalAction.GET_CONNECT_WALLET,
      this.lockService.ensure,
      this.miscStorageService.getExternalWalletConnection,
    );

    // Browser
    this.handler.add(RPCInternalAction.CLOSE_POPUP, this.browserService.closePopup);
    this.handler.add(RPCInternalAction.CLEAR_STORAGE, this.lockService.ensure, this.browserService.clearStorage);
    this.handler.add(RPCInternalAction.PUSH_EVENT, this.lockService.ensure, this.browserService.pushEvent);

    return this;
  };
}
