export enum RPCExternalAction {
  // EXTERNAL
  GENERATE_SEMAPHORE_PROOF = "rpc/injector/proofs/generate-semaphore-proof",
  GENERATE_RLN_PROOF = "rpc/injector/proofs/generate-rln-proof",
  CONNECT = "rpc/injector/approve-connect",
  GET_CONNECTED_IDENTITY_DATA = "rpc/injector/identity/getConnectedIdentityData",
  JOIN_GROUP_REQUEST = "rpc/injector/group/joinRequest",
  GENERATE_GROUP_MERKLE_PROOF_REQUEST = "rpc/injector/groups/generateGroupMerkleProofRequest",
  // TODO: the following 4 RPC calls will be refactored in another PR
  GENERATE_VERIFIABLE_PRESENTATION_REQUEST = "rpc/credentials/generateVerifiablePresentationRequest",
  ADD_VERIFIABLE_CREDENTIAL_REQUEST = "rpc/credentials/addVerifiableCredentialRequest",
  REVEAL_CONNECTED_IDENTITY_COMMITMENT_REQUEST = "rpc/identity/revealConnectedIdentityCommitmentRequest",
}
