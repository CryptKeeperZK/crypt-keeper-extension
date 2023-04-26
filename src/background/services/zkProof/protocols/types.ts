import type { ZkIdentitySemaphore } from "@src/background/services/zkIdentity/protocols/ZkIdentitySemaphore";

export interface IZkProof<Request, Return> {
  genProof(identityCommitment: ZkIdentitySemaphore, request: Request): Promise<Return>;
}
