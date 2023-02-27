import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { RLN, RLNFullProof } from "rlnjs";
import { bigintToHex } from "bigint-conversion";

import ZkIdentityDecorater from "@src/background/identityDecorater";

import { RLNProofRequest } from "./interfaces";
import { deserializeMerkleProof, generateMerkleProof } from "./utils";
import { MerkleProofArtifacts } from "@src/types";

export default class RLNService {
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
    }: RLNProofRequest,
  ): Promise<RLNFullProof> {
    try {
      const rln = new RLN(circuitFilePath, zkeyFilePath, verificationKey);

      const identityCommitment = identity.genIdentityCommitment();

      const merkleProof = merkleStorageAddress
        ? await this.getRemoteMerkleProof(merkleStorageAddress, bigintToHex(identityCommitment))
        : generateMerkleProof({
            treeDepth: (merkleProofArtifacts as MerkleProofArtifacts).depth,
            member: identityCommitment,
            members: [identityCommitment],
          });

      return rln.generateProof(signal, merkleProof, externalNullifier);
    } catch (e) {
      throw new Error(`Error while generating RLN proof: ${e}`);
    }
  }

  private async getRemoteMerkleProof(
    merkleStorageAddress: string,
    identityCommitmentHex: string,
  ): Promise<MerkleProof> {
    return fetch(merkleStorageAddress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identityCommitment: identityCommitmentHex,
      }),
    })
      .then(res => res.json())
      .then(response => deserializeMerkleProof(response.data.merkleProof));
  }
}
