import { generateProof } from "@semaphore-protocol/proof";

import ZkIdentityDecorater from "@src/background/identityDecorater";

import { SemaphoreProof, SemaphoreProofRequest } from "./interfaces";
import { getMerkleProof } from "./utils";

export default class SemaphoreService {
  async genProof(identity: ZkIdentityDecorater, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
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
