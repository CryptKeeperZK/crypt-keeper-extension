import ZkIdentityDecorater from "@src/background/identityDecorater";

export abstract class ZkProof<Request, Return> {
  protected abstract genProof(identity: ZkIdentityDecorater, request: Request): Promise<Return>;
}
