import { RLN, RLNFullProof } from "rlnjs";

import ZkIdentityDecorater from "@src/background/identityDecorater";
import { RLNProofRequest } from "@src/types";

import { getMerkleProof, getRlnVerficationKeyJson } from "./utils";
import { ZkProof } from "./ZkProof";

export class RLNService extends ZkProof {
  async genProof(
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
    const rlnVerificationKeyJson = await getRlnVerficationKeyJson(verificationKey);

    const rln = new RLN(circuitFilePath, zkeyFilePath, rlnVerificationKeyJson);

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
