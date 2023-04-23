import { ZkIdentityDecorater } from "@src/background/services/zkIdentity/services/zkIdentityDecorater";

export interface IZkProof<Request, Return> {
  genProof(identityCommitment: ZkIdentityDecorater, request: Request): Promise<Return>;
}
