import { JsonRpcSigner } from "@ethersproject/providers";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

export type Request = {
  method: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};

export type WalletInfo = {
  account: string;
  balance: number | string;
  networkName: string; // TODO: use `NetworkDetails` instead
  chainId: number;
};

export interface WalletInfoBackgound extends WalletInfo {
  signer: JsonRpcSigner;
}

export type NetworkDetails = {
  chainId: number;
  ensAddress: string;
  name: string;
};

export type CreateInterrepIdentityMetadata = {
  web2Provider: CreateIdentityWeb2Provider;
  nonce?: number;
  name?: string;
};

export type CreateRandomIdentityMetadata = {
  name?: string;
};

export type CreateIdentityMetadata = CreateInterrepIdentityMetadata | CreateRandomIdentityMetadata;

export type CreateIdentityStrategy = "interrep" | "random";
export type CreateIdentityWeb2Provider = "twitter" | "github" | "reddit";

export type CreateIdentityOptions = {
  nonce?: number;
  web2Provider?: CreateIdentityWeb2Provider;
  account?: string;
  name?: string;
};

export type NewIdentityRequest = {
  strategy: CreateIdentityStrategy;
  messageSignature: string;
  options: CreateIdentityOptions;
};

export type MerkleProofArtifacts = {
  leaves: string[];
  depth: number;
  leavesPerNode: number;
};

export type ZkInputs = {
  circuitFilePath: string;
  zkeyFilePath: string;
  merkleStorageAddress?: string;
  merkleProofArtifacts?: MerkleProofArtifacts;
  merkleProof?: MerkleProof;
};

export enum PendingRequestType {
  SEMAPHORE_PROOF,
  DUMMY,
  APPROVE,
  INJECT,
  CREATE_IDENTITY,
}

export type PendingRequest = {
  id: string;
  type: PendingRequestType;
  payload?: any;
};

export type RequestResolutionAction<data> = {
  id: string;
  status: "accept" | "reject";
  data?: data;
};

export type FinalizedRequest = {
  id: string;
  action: boolean;
};

export type ApprovalAction = {
  host: string;
  action: "add" | "remove";
};

export type ZkIdentity = {
  identityMetadata: IdentityMetadata;
};

export type IdentityMetadata = {
  account: string;
  name: string;
  web2Provider: CreateIdentityStrategy;
};

export type IdentityName = {
  identityCommitment: string;
  name: string;
};

export type SerializedIdentity = {
  metadata: IdentityMetadata;
  secret: string;
};

export enum ZkProofType {
  SEMAPHORE,
  RLN,
}

export type MessageAction = {
  method: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};

export type ReduxAction = {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: any;
};

export interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve?: (arg: T | PromiseLike<T>) => void;
  reject?: (reason?: unknown) => void;
}
