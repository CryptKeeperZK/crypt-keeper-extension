import type { IRLNProofRequest, ISemaphoreProofRequest } from "@cryptkeeperzk/types";

export interface IProofRequest<P = IRLNProofRequest | ISemaphoreProofRequest> {
  identity: string;
  payload: P;
}
