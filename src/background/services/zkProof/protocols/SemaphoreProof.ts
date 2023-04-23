import { generateProof } from "@semaphore-protocol/proof";

import { ZkIdentityDecorater } from "@src/background/services/zkIdentity/services/zkIdentityDecorater";
import { SemaphoreProof, SemaphoreProofRequest } from "@src/types";

import { IZkProof } from "./IZkProof";
import { getMerkleProof } from "./utils";

export class SemaphoreProofService implements IZkProof<SemaphoreProofRequest, SemaphoreProof> {
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
