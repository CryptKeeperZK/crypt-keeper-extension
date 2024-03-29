export enum RPCExternalAction {
  // EXTERNAL
  GENERATE_SEMAPHORE_PROOF = "rpc/injector/proofs/generateSemaphoreProof",
  GENERATE_RLN_PROOF = "rpc/injector/proofs/generateRlnProof",
  CONNECT = "rpc/injector/connect",
  GET_CONNECTED_IDENTITY_DATA = "rpc/injector/identity/getConnectedIdentityData",
  JOIN_GROUP = "rpc/injector/group/join",
  GENERATE_GROUP_MERKLE_PROOF = "rpc/injector/groups/generateGroupMerkleProof",
  IMPORT_IDENTITY = "rpc/injector/identity/import",
  REVEAL_CONNECTED_IDENTITY_COMMITMENT = "rpc/injector/identity/revealConnectedIdentityCommitment",
  GENERATE_VERIFIABLE_PRESENTATION = "rpc/injector/credentials/generateVerifiablePresentation",
  ADD_VERIFIABLE_CREDENTIAL = "rpc/injector/credentials/addVerifiableCredential",
}
