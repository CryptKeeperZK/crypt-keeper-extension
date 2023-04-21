import ZkIdentityDecorater from "@src/background/identityDecorater";

export abstract class ZkProof {
  abstract genProof(identity: ZkIdentityDecorater, request: unknown): unknown;
}
