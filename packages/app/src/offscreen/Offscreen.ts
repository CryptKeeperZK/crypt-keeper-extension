import { RPCAction } from "@cryptkeeperzk/providers";
import { FullProof, generateProof } from "@cryptkeeperzk/semaphore-proof";
import { RequestHandler, SemaphoreProofRequest } from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, getMerkleProof } from "@cryptkeeperzk/zk";

import Handler from "@src/background/controllers/handler";

export class OffscreenController {
  private handler: Handler;

  constructor() {
    this.handler = new Handler();
  }

  handle = (request: RequestHandler): Promise<unknown> => this.handler.handle(request);

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
    verificationKey,
    zkeyFilePath,
  }: SemaphoreProofRequest): Promise<FullProof> => {
    const identityGenerated = ZkIdentitySemaphore.genFromSerialized(identitySerialized);

    const identityCommitment = identityGenerated.genIdentityCommitment();

    const merkleProof = await getMerkleProof({
      identityCommitment,
      merkleProofArtifacts,
    });

    const fullProof = await generateProof(identityGenerated.zkIdentity, merkleProof, externalNullifier, signal, {
      wasmFilePath: circuitFilePath,
      zkeyFilePath,
    });

    return fullProof;
  };
}
