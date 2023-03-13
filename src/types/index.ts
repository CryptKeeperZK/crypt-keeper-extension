import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
import type { MerkleProof } from "@zk-kit/incremental-merkle-tree";

export type HandlerRequest = {
  method: string;
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};

export type Action<ActionType, Payload> = {
  type: ActionType;
  payload?: Payload;
  meta?: any;
  error?: boolean;
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

export enum PendingRequestType {
  SEMAPHORE_PROOF,
  RLN_PROOF,
  DUMMY,
  APPROVE,
  INJECT,
  CREATE_IDENTITY,
}

export type PendingRequest = {
  id: string;
  type: PendingRequestType;
  payload?: unknown;
};

export type RequestResolutionAction<data> = {
  id: string;
  status: "accept" | "reject";
  data?: data;
};

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
  readonly icon: IconDefinition | null;
};
