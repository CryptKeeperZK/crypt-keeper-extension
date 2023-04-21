import { generateProof } from "@semaphore-protocol/proof";

import ZkIdentityDecorater from "@src/background/identityDecorater";
import { SemaphoreProof, SemaphoreProofRequest } from "@src/types";

import { getMerkleProof } from "./utils";
import { ZkProof } from "./ZkProof";

export class SemaphoreService extends ZkProof {
  async genProof(
    identity: ZkIdentityDecorater,
    {
      circuitFilePath,
      zkeyFilePath,
      merkleStorageAddress,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleProof: providerMerkleProof,
    }: SemaphoreProofRequest,
  ): Promise<SemaphoreProof> {
    const identityCommitment = identity.genIdentityCommitment();

    const merkleProof = await getMerkleProof({
      identityCommitment,
      merkleProofArtifacts,
      merkleStorageAddress,
      providerMerkleProof,
    });

    // TODO: do we need to leave `SnarkArtifacts` param as undefinded?
    const fullProof = await generateProof(identity.zkIdentity, merkleProof, externalNullifier, signal, {
      wasmFilePath: circuitFilePath,
      zkeyFilePath,
    });

    return { fullProof };
  }
}
