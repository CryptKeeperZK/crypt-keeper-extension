export enum RPCAction {
  UNLOCK = "rpc/unlock",
  LOCK = "rpc/lock",
  GET_STATUS = "rpc/getStatus",
  CONNECT = "rpc/connect",
  CONNECT_IDENTITY_REQUEST = "rpc/connectIdentityRequest",
  SETUP_PASSWORD = "rpc/lock/setupPassword",
  RESET_PASSWORD = "rpc/lock/resetPassword",
  CHECK_PASSWORD = "rpc/lock/checkPassword",
  CREATE_IDENTITY = "rpc/identity/createIdentity",
  CREATE_IDENTITY_REQUEST = "rpc/identity/createIdentityRequest",
  CONNECT_IDENTITY = "rpc/identity/connectIdentity",
  SET_IDENTITY_NAME = "rpc/identity/setIdentityName",
  SET_IDENTITY_HOST = "rpc/identity/setIdentityHost",
  DELETE_IDENTITY = "rpc/identity/deleteIdentity",
  DELETE_ALL_IDENTITIES = "rpc/identity/deleteAllIdentities",
  GET_CONNECTED_IDENTITY_DATA = "rpc/identity/getConnectedIdentityData",
  GET_COMMITMENTS = "rpc/identity/getIdentityCommitments",
  GET_IDENTITIES = "rpc/identity/getIdentities",
  GET_REQUEST_PENDING_STATUS = "rpc/identity/getRequestPendingStatus",
  FINALIZE_REQUEST = "rpc/requests/finalize",
  GET_PENDING_REQUESTS = "rpc/requests/get",
  PREPARE_SEMAPHORE_PROOF_REQUEST = "rpc/protocols/semaphore/prepareProofRequest",
  PREPARE_RLN_PROOF_REQUEST = "rpc/protocols/rln/prepareProofRequest",
  NRLN_PROOF = "rpc/protocols/nrln/genProof",
  DUMMY_REQUEST = "rpc/protocols/semaphore/dummyReuqest",
  APPROVE_HOST = "rpc/hosts/approve",
  IS_HOST_APPROVED = "rpc/hosts/isHostApprove",
  GET_HOST_PERMISSIONS = "rpc/hosts/getHostPermissions",
  SET_HOST_PERMISSIONS = "rpc/hosts/setHostPermissions",
  REMOVE_HOST = "rpc/hosts/remove",
  CLOSE_POPUP = "rpc/popup/close",
  GET_CONNECT_WALLET = "rpc/wallet/get/connect",
  SET_CONNECT_WALLET = "rpc/wallet/connect",
  LOAD_IDENTITY_HISTORY = "rpc/identity/loadHistory",
  GET_IDENTITY_HISTORY = "rpc/identity/getHistory",
  DELETE_HISTORY_OPERATION = "rpc/identity/deleteHistoryOperation",
  DELETE_ALL_HISTORY_OPERATIONS = "rpc/identity/deleteHistory",
  ENABLE_OPERATION_HISTORY = "rpc/identity/historyEnable",
  DOWNLOAD_BACKUP = "rpc/backup/download",
  REQUEST_UPLOAD_BACKUP = "rpc/backup/requestUpload",
  REQUEST_ONBOARDING_BACKUP = "rpc/backup/requestOnboarding",
  UPLOAD_BACKUP = "rpc/backup/upload",
  SAVE_MNEMONIC = "rpc/mnemonic/save",
  GENERATE_MNEMONIC = "rpc/mnemonic/generate",
  CHECK_MNEMONIC = "rpc/mnemonic/check",
  GET_MNEMONIC = "rpc/mnemonic/get",
  GET_ACCOUNTS = "rpc/accounts/get",
  SELECT_ACCOUNT = "rpc/accounts/select-account",
  GET_SELECTED_ACCOUNT = "rpc/accounts/get-selected-account",
  GENERATE_SEMAPHORE_PROOF = "rpc/proofs/generate-semaphore-proof",
  GENERATE_SEMAPHORE_PROOF_OFFSCREEN = "rpc/proofs/generate-semaphore-proof-offscreen",
  SEMAPHORE_PROOF_RESULT = "rpc/proofs/semaphore-proof-result",
<<<<<<< HEAD
  GENERATE_RLN_PROOF = "rpc/proofs/generate-rln-proof",
  GENERATE_RLN_PROOF_OFFSCREEN = "rpc/proofs/generate-rln-proof-offscreen",
  RLN_PROOF_RESULT = "rpc/proofs/rln-proof-result",
=======
>>>>>>> e458d93 (fix: use deserialization when rendering verifiable credentials (#493))
  ADD_VERIFIABLE_CREDENTIAL = "rpc/credentials/addVerifiableCredential",
  GET_ALL_VERIFIABLE_CREDENTIALS = "rpc/credentials/getAllVerifiableCredentials",
  DELETE_VERIFIABLE_CREDENTIAL = "rpc/credentials/deleteVerifiableCredential",
  DELETE_ALL_VERIFIABLE_CREDENTIALS = "rpc/credentials/deleteAllVerifiableCredentials",
  // DEV RPCS
  CLEAR_APPROVED_HOSTS = "rpc/hosts/clear",
  CLEAR_STORAGE = "rpc/browser/clear",
}
