import ZkIdentityDecorater from "@src/background/identityDecorater";

export abstract class ZkProof {
  abstract genProof<Request, Return>(identity: ZkIdentityDecorater, request: Request): Return;
}
