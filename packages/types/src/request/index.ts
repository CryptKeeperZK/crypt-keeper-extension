export enum RequestResolutionStatus {
  ACCEPT = "accept",
  REJECT = "reject",
}

export interface RequestHandler<P = unknown, M = unknown> {
  method: string;
  payload?: P;
  error?: Error;
  meta?: M;
  source?: "offscreen";
}

export enum PendingRequestType {
  SEMAPHORE_PROOF,
  RLN_PROOF,
  APPROVE,
  CONNECT,
}

export interface PendingRequest<P = unknown> {
  id: string;
  windowId?: number;
  type: PendingRequestType;
  payload?: P;
}
