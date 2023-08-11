import type { IRlnProofRequest, ISemaphoreProofRequest } from "@src/types";

export interface IProofRequest<P = IRlnProofRequest | ISemaphoreProofRequest> {
  identity: string;
  payload: P;
}

export interface IMeta {
  origin: string;
}

export interface IConnectData {
  isApproved: boolean;
  canSkipApprove: boolean;
}
