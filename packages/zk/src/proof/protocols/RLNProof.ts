import { RLNProver } from "@cryptkeeperzk/rlnjs";

import { ZkIdentitySemaphore } from "@src/identity";

import type { IRLNProofRequest, IRLNProverInputs, IRLNFullProof } from "@cryptkeeperzk/types";

import { IZkProof } from "./types";
import { getMerkleProof, getMessageHash } from "./utils";

export class RLNProofService implements IZkProof<IRLNProofRequest, IRLNFullProof> {
  async genProof(
    identity: ZkIdentitySemaphore,
    {
      rlnIdentifier,
      message,
      messageId,
      messageLimit,
      epoch,
      circuitFilePath,
      zkeyFilePath,
      merkleProofArtifacts,
      merkleStorageUrl,
      merkleProofProvided,
    }: IRLNProofRequest,
  ): Promise<IRLNFullProof> {
    if (!circuitFilePath || !zkeyFilePath) {
      throw new Error("Zk service: Must set circuitFilePath and zkeyFilePath");
    }

    const prover = new RLNProver(circuitFilePath, zkeyFilePath);

    const rlnIdentifierBigInt = BigInt(rlnIdentifier);
    const userMessageLimit = BigInt(messageLimit);
    const messageHash = getMessageHash(message);
    const identityCommitment = identity.genIdentityCommitment();
    const identitySecret = identity.zkIdentity.getSecret();
    const epochBigInt = BigInt(epoch);
    const merkleProof =
      merkleProofProvided ||
      (await getMerkleProof({
        identityCommitment,
        merkleProofArtifacts,
        merkleStorageUrl,
      }));

    if (!merkleProof) {
      throw new Error("No merkle proof error");
    }

    const proofInputs: IRLNProverInputs = {
      rlnIdentifier: rlnIdentifierBigInt,
      identitySecret,
      userMessageLimit,
      messageId: BigInt(messageId),
      merkleProof,
      x: messageHash,
      epoch: epochBigInt,
    };

    const { snarkProof } = await prover.generateProof(proofInputs);

    return snarkProof;
  }
}
