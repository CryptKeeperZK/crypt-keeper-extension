export enum RequestResolutionStatus {
  ACCEPT = "accept",
  REJECT = "reject",
}

export type RequestHandler = {
  method: string;
  payload?: unknown;
  error?: boolean;
  meta?: unknown;
};

export enum PendingRequestType {
  SEMAPHORE_PROOF,
  RLN_PROOF,
  APPROVE,
  INJECT,
  CHECK_AVIABLE_IDENTITIES,
  CREATE_IDENTITY,
}

export interface PendingRequest<P = unknown> {
  id: string;
  windowId?: number;
  type: PendingRequestType;
  payload?: P;
}
