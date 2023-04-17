import { generateProof } from "@semaphore-protocol/proof";

import { IdentityDecoraterService } from "@src/background/services/identity";
import { SemaphoreProof, SemaphoreProofRequest } from "@src/types";

import { getMerkleProof } from "./utils";

export class SemaphoreService {
  public async genProof(identity: IdentityDecoraterService, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
    const {
      circuitFilePath,
      zkeyFilePath,
      merkleStorageAddress,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleProof: providerMerkleProof,
    } = request;

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
