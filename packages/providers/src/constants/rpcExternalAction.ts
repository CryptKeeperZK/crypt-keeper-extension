export enum RPCExternalAction {
  // EXTERNAL
  INJECTOR_GENERATE_SEMAPHORE_PROOF = "rpc/injector/proofs/generate-semaphore-proof",
  INJECTOR_GENERATE_RLN_PROOF = "rpc/injector/proofs/generate-rln-proof",
  INJECTOR_CONNECT_IDENTITY = "rpc/injector/approve-connect",
  INJECTOR_GET_CONNECTED_IDENTITY_DATA = "rpc/injector/identity/getConnectedIdentityData",
  // TODO: the following 4 RPC calls will be refactored in another PR
  JOIN_GROUP_REQUEST = "rpc/group/joinRequest",
  GENERATE_GROUP_MERKLE_PROOF_REQUEST = "rpc/groups/generateGroupMerkleProofRequest",
  GENERATE_VERIFIABLE_PRESENTATION_REQUEST = "rpc/credentials/generateVerifiablePresentationRequest",
  ADD_VERIFIABLE_CREDENTIAL_REQUEST = "rpc/credentials/addVerifiableCredentialRequest",
  REVEAL_CONNECTED_IDENTITY_COMMITMENT_REQUEST = "rpc/identity/revealConnectedIdentityCommitmentRequest",
}
