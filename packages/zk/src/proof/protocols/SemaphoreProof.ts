import { generateProof } from "@cryptkeeperzk/semaphore-proof";

import { ZkIdentitySemaphore } from "@src/identity";

import type { SemaphoreFullProof, ISemaphoreProofRequest } from "@cryptkeeperzk/types";

import { IZkProof } from "./types";
import { getMerkleProof } from "./utils";

export class SemaphoreProofService implements IZkProof<ISemaphoreProofRequest, SemaphoreFullProof> {
  async genProof(
    identity: ZkIdentitySemaphore,
    {
      circuitFilePath,
      zkeyFilePath,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleStorageAddress,
      merkleProofProvided,
    }: ISemaphoreProofRequest,
  ): Promise<SemaphoreFullProof> {
    if (!circuitFilePath || !zkeyFilePath) {
      throw new Error("Zk service: Must set circuitFilePath and zkeyFilePath");
    }

    const identityCommitment = identity.genIdentityCommitment();

    const merkleProof =
      merkleProofProvided ||
      (await getMerkleProof({
        identityCommitment,
        merkleProofArtifacts,
        merkleStorageAddress,
      }));

    // TODO: do we need to leave `SnarkArtifacts` param as undefinded?
    const fullProof = await generateProof(identity.zkIdentity, merkleProof, externalNullifier, signal, {
      wasmFilePath: circuitFilePath,
      zkeyFilePath,
    });

    return fullProof;
  }
}
