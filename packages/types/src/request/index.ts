export enum RequestResolutionStatus {
  ACCEPT = "accept",
  REJECT = "reject",
}

/**
 * Represents a request handler.
 *
 * @typedef {object} RequestHandler
 * @property {string} method - The method of the request.
 * @property {P} [payload] - The payload of the request.
 * @property {Error} [error] - The error associated with the request.
 * @property {M} [meta] - Additional metadata for the request.
 * @property {"offscreen"} [source] - The source of the request.
 * @template P - The type of the payload.
 * @template M - The type of the metadata.
 */
export interface IRequestHandler<P = unknown, M = unknown> {
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

export interface IPendingRequest<P = unknown> {
  id: string;
  windowId?: number;
  type: PendingRequestType;
  payload?: P;
}

export interface IRejectedRequest<P = unknown> {
  type: string;
  payload?: P;
}
