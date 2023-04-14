export enum RPCAction {
  UNLOCK = "rpc/unlock",
  LOCK = "rpc/lock",
  GET_STATUS = "rpc/getStatus",
  TRY_INJECT = "rpc/inject",
  SETUP_PASSWORD = "rpc/lock/setupPassword",
  CREATE_IDENTITY = "rpc/identity/createIdentity",
  CREATE_IDENTITY_REQ = "rpc/identity/createIdentityRequest",
  SET_ACTIVE_IDENTITY = "rpc/identity/setActiveIdentity",
  SET_IDENTITY_NAME = "rpc/identity/setIdentityName",
  DELETE_IDENTITY = "rpc/identity/deleteIdentity",
  DELETE_ALL_IDENTITIES = "rpc/identity/deleteAllIdentities",
  GET_ACTIVE_IDENTITY_DATA = "rpc/identity/getActiveidentityData",
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
  LOAD_IDENTITY_HISTORY = "rpc/identity/load-history",
  GET_IDENTITY_HISTORY = "rpc/identity/get-history",
  DELETE_HISTORY_OPERATION = "rpc/identity/delete-history-operation",
  DELETE_ALL_HISTORY_OPERATIONS = "rpc/identity/delete-history",
  ENABLE_OPERATION_HISTORY = "rpc/identity/history-enable",
  // DEV RPCS
  CLEAR_APPROVED_HOSTS = "rpc/hosts/clear",
}
