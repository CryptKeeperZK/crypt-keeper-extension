import { RLNProver, RLNSNARKProof } from "@cryptkeeperzk/rln-proof";

import { ZkIdentitySemaphore } from "@src/identity";

import type { IRlnProofRequest, IRlnProverInputs } from "@cryptkeeperzk/types";

import { IZkProof } from "./types";
import { getMerkleProof, getMessageHash } from "./utils";

export class RLNProofService implements IZkProof<IRlnProofRequest, RLNSNARKProof> {
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
      merkleStorageAddress,
      merkleProofProvided,
    }: IRlnProofRequest,
  ): Promise<RLNSNARKProof> {
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
        merkleStorageAddress,
      }));

    const proofInputs: IRlnProverInputs = {
      rlnIdentifier: rlnIdentifierBigInt,
      identitySecret,
      userMessageLimit,
      messageId: BigInt(messageId),
      merkleProof,
      messageHash,
      epoch: epochBigInt,
    };

    const { snarkProof } = await prover.generateProof(proofInputs);

    return snarkProof;
  }
}
