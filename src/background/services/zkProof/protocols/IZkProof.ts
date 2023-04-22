import ZkIdentityDecorater from "@src/background/identityDecorater";

export interface IZkProof<Request, Return> {
  genProof(identity: ZkIdentityDecorater, request: Request): Promise<Return>;
}
