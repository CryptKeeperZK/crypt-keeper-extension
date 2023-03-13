import { RLN, RLNFullProof } from "rlnjs";

import ZkIdentityDecorater from "@src/background/identityDecorater";

import { RLNProofRequest } from "./interfaces";
import { getMerkleProof } from "./utils";

export default class RLNService {
  public async genProof(
    identity: ZkIdentityDecorater,
    {
      circuitFilePath,
      zkeyFilePath,
      verificationKey,
      merkleStorageAddress,
      externalNullifier,
      signal,
      merkleProofArtifacts,
      merkleProof: providerMerkleProof,
    }: RLNProofRequest,
  ): Promise<RLNFullProof> {
    const rln = new RLN(circuitFilePath, zkeyFilePath, verificationKey);

    const identityCommitment = identity.genIdentityCommitment();

    const merkleProof = await getMerkleProof({
      identityCommitment,
      merkleProofArtifacts,
      merkleStorageAddress,
      providerMerkleProof,
    });

    return rln.generateProof(signal, merkleProof, externalNullifier);
  }
}
