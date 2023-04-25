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
  BACKUP_IMPORT,
  BACKUP_EXPORT,
}

export interface PendingRequest<P = unknown> {
  id: string;
  windowId?: number;
  type: PendingRequestType;
  payload?: P;
}
