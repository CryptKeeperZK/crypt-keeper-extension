import { generateProof, packToSolidityProof } from "@semaphore-protocol/proof";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { bigintToHex } from "bigint-conversion";
import { MerkleProofArtifacts } from "@src/types";
import { SemaphoreProof, SemaphoreProofRequest } from "./interfaces";
import { deserializeMerkleProof, generateMerkleProof } from "./utils";
import log from "loglevel";
import ZkIdentityDecorater from "@src/background/identity-decorater";

export default class SemaphoreService {
  // eslint-disable-next-line class-methods-use-this
  async genProof(identity: ZkIdentityDecorater, request: SemaphoreProofRequest): Promise<SemaphoreProof> {
    try {
      const {
        circuitFilePath,
        zkeyFilePath,
        merkleStorageAddress,
        externalNullifier,
        signal,
        merkleProofArtifacts,
        merkleProof: _merkleProof,
      } = request;
      let merkleProof: MerkleProof;
      const identityCommitment = identity.genIdentityCommitment();
      const identityCommitmentHex = bigintToHex(identityCommitment);

      if (_merkleProof) {
        merkleProof = _merkleProof;
      } else if (merkleStorageAddress) {
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

        //const leaves = proofArtifacts.leaves.map((leaf) => hexToBigint(leaf))

        merkleProof = generateMerkleProof({ treeDepth: proofArtifacts.depth, member: identityCommitment });
      }

      // TODO: do we need to leave `SnarkArtifacts` param as undefinded?
      const fullProof = await generateProof(identity.zkIdentity, merkleProof, externalNullifier, signal, {
        wasmFilePath: circuitFilePath,
        zkeyFilePath: zkeyFilePath,
      });

      const solidityProof = packToSolidityProof(fullProof.proof);

      log.debug("Generating Semaphore Identity has done successfully.");
      log.debug("- Full Proof:", fullProof);
      log.debug("- Semaphore Solidity proof:", solidityProof);

      return {
        fullProof,
        solidityProof,
      };
    } catch (e) {
      throw new Error(`Error while generating semaphore proof: ${e}`);
    }
  }
}
