import { generateProof } from "@semaphore-protocol/proof";

import { ZkIdentitySemaphore } from "@src/identity";

import type { SemaphoreProof, SemaphoreProofRequest } from "@cryptkeeper/types";

import { IZkProof } from "./types";
import { getMerkleProof } from "./utils";

export class SemaphoreProofService implements IZkProof<SemaphoreProofRequest, SemaphoreProof> {
  async genProof(
    identity: ZkIdentitySemaphore,
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
