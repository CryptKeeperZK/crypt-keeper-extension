import { IconProp } from "@fortawesome/fontawesome-svg-core";

import type { MerkleProof } from "@zk-kit/incremental-merkle-tree";
// TODO: remove `rlnjs/dist/types/types`

export type { VerificationKeyT } from "rlnjs/dist/types/types";

export type HandlerRequest = {
  method: string;
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};

export type IdentityStrategy = "interrep" | "random";
export type IdentityWeb2Provider = "twitter" | "github" | "reddit";

export type CreateIdentityOptions = {
  nonce?: number;
  web2Provider?: IdentityWeb2Provider;
  account?: string;
  name?: string;
};

export type NewIdentityRequest = {
  strategy: IdentityStrategy;
  messageSignature: string;
  options: CreateIdentityOptions;
};

export type MerkleProofArtifacts = {
  leaves: string[];
  depth: number;
  leavesPerNode: number;
};

export type ZkInputs = {
  merkleStorageAddress?: string;
  merkleProofArtifacts?: MerkleProofArtifacts;
  merkleProof?: MerkleProof;
};

export interface ProofPayload {
  externalNullifier: string;
  signal: string;
  merkleStorageAddress?: string;
  circuitFilePath: string;
  verificationKey: string;
  zkeyFilePath: string;
  origin: string;
}

export enum PendingRequestType {
  SEMAPHORE_PROOF,
  RLN_PROOF,
  APPROVE,
  INJECT,
}

export interface PendingRequest<P = unknown> {
  id: string;
  windowId?: number;
  type: PendingRequestType;
  payload?: P;
}

export type RequestResolutionAction<data = unknown> = {
  id: string;
  status: RequestResolutionStatus;
  data?: data;
};

export enum RequestResolutionStatus {
  ACCEPT = "accept",
  REJECT = "reject",
}

export type IdentityMetadata = {
  account: string;
  name: string;
  identityStrategy: IdentityStrategy;
  web2Provider?: IdentityWeb2Provider;
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
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};

export type ReduxAction = {
  type: string;
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};

export interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve?: (arg: T | PromiseLike<T>) => void;
  reject?: (reason?: unknown) => void;
}

export type SelectOption = {
  readonly value: string;
  readonly label: string;
  readonly icon: IconProp | null;
};

export interface PasswordFormFields {
  password: string;
  confirmPassword: string;
}

export interface InjectedMessageData<M = unknown, P = unknown> {
  target: string;
  nonce: string;
  message: M;
  payload: [string, P];
}

export enum OperationType {
  CREATE_IDENTITY = "CREATE_IDENTITY",
  DELETE_IDENTITY = "DELETE_IDENTITY",
}

export interface Operation {
  id: string;
  type: OperationType;
  identity: {
    commitment: string;
    metadata: IdentityMetadata;
  };
  createdAt: string;
}
