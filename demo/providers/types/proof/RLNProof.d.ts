import { SemaphoreProofRequest } from "./SemaphoreProof";
export type { RLNFullProof, VerificationKey } from "rlnjs";
export interface RLNProofRequest extends SemaphoreProofRequest {
    rlnIdentifier: string;
}
export interface IRlnGenerateArgs {
    identity: string;
    payload: RLNProofRequest;
}
