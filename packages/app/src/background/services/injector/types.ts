import type { RLNProofRequest, SemaphoreProofRequest } from "@src/types";

export interface IProofRequest<P = RLNProofRequest | SemaphoreProofRequest> {
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
