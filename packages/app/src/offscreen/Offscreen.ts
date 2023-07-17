import { RPCAction } from "@cryptkeeperzk/providers";
import { FullProof, generateProof } from "@cryptkeeperzk/semaphore-proof";
import { RequestHandler, SemaphoreProofRequest } from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, getMerkleProof } from "@cryptkeeperzk/zk";
import { Runtime } from "webextension-polyfill";

import Handler from "@src/background/controllers/handler";

const RPC_METHOD_ACCESS: Record<RPCAction, boolean> = {
  ...Object.values(RPCAction).reduce((acc, method) => ({ ...acc, [method]: false }), {} as Record<RPCAction, boolean>),
  [RPCAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN]: true,
};

export class OffscreenController {
  private handler: Handler;

  constructor() {
    this.handler = new Handler();
  }

  handle = (request: RequestHandler, sender: Runtime.MessageSender): Promise<unknown> =>
    this.handler.handle(request, { sender, bypass: RPC_METHOD_ACCESS[request.method as RPCAction] });

  initialize = (): OffscreenController => {
    this.handler.add(RPCAction.GENERATE_SEMAPHORE_PROOF_OFFSCREEN, this.generateSemaphoreProof);
    return this;
  };

  generateSemaphoreProof = async ({
    circuitFilePath,
    externalNullifier,
    identitySerialized,
    merkleProofArtifacts,
    signal,
    zkeyFilePath,
  }: SemaphoreProofRequest): Promise<FullProof> => {
    const identityGenerated = ZkIdentitySemaphore.genFromSerialized(identitySerialized);

    const identityCommitment = identityGenerated.genIdentityCommitment();

    const merkleProof = await getMerkleProof({
      identityCommitment,
      merkleProofArtifacts,
    });

    return generateProof(identityGenerated.zkIdentity, merkleProof, externalNullifier, signal, {
      wasmFilePath: circuitFilePath,
      zkeyFilePath,
    });
  };
}
