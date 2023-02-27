import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { RLN, RLNFullProof } from "rlnjs";
import { bigintToHex } from "bigint-conversion";
import { MerkleProofArtifacts } from "@src/types";
import ZkIdentityDecorater from "@src/background/identityDecorater";
import { RLNProofRequest } from "./interfaces";
import { deserializeMerkleProof, generateMerkleProof } from "./utils";

export default class RLNService {
  async genProof(identity: ZkIdentityDecorater, request: RLNProofRequest): Promise<RLNFullProof> {
    try {
      const {
        circuitFilePath,
        zkeyFilePath,
        verificationKey,
        merkleStorageAddress,
        externalNullifier,
        signal,
        merkleProofArtifacts,
      } = request;
      let merkleProof: MerkleProof;

      const rln = new RLN(circuitFilePath, zkeyFilePath, verificationKey);

      const identityCommitment = identity.genIdentityCommitment();
      const identityCommitmentHex = bigintToHex(identityCommitment);

      if (merkleStorageAddress) {
        const response = await fetch(merkleStorageAddress, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identityCommitment: identityCommitmentHex,
          }),
        }).then(res => res.json());

        merkleProof = deserializeMerkleProof(response.data.merkleProof);
      } else {
        const proofArtifacts = merkleProofArtifacts as MerkleProofArtifacts;

        merkleProof = generateMerkleProof({
          treeDepth: proofArtifacts.depth,
          member: identityCommitment,
          members: [identityCommitment],
        });
      }

      return rln.generateProof(signal, merkleProof, externalNullifier);
    } catch (e) {
      throw new Error(`Error while generating RLN proof: ${e}`);
    }
  }
}
