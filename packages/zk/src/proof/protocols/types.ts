import type { ZkIdentitySemaphore } from "@src/identity";

export interface IZkProof<Request, Return> {
  genProof(identityCommitment: ZkIdentitySemaphore, request: Request): Promise<Return>;
}
