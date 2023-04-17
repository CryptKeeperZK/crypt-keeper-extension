import { RLN, RLNFullProof } from "rlnjs";

import { IdentityDecoraterService } from "@src/background/services/Identity";
import { RLNProofRequest } from "@src/types";

import { getMerkleProof, getRlnVerficationKeyJson } from "./utils";

export class RLNService {
  public async genProof(
    identity: IdentityDecoraterService,
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
