import { RPCExternalAction, initializeCryptKeeper } from "@cryptkeeperzk/providers";
import { encodeBytes32String } from "ethers";

import { MerkleProofType } from "@src/types";

import type { IMerkleProofArtifacts } from "@cryptkeeperzk/types";

const client = initializeCryptKeeper();

interface IGenerateSemaphoreProofParams {
  proofType: MerkleProofType;
  externalNullifier: string;
  signal: string;
}

const genSemaphoreProof = async ({
  proofType,
  externalNullifier = encodeBytes32String("voting-1"), // Example,
  signal = encodeBytes32String("hello-world"), // Example
}: IGenerateSemaphoreProofParams): Promise<void> => {
  let merkleProofSource: string | IMerkleProofArtifacts = `<HTTP/S_LINK>`;

  if (proofType === MerkleProofType.ARTIFACTS) {
    const exampleGroupIdentityCommitments: string[] = [
      "80877997493538069559805206308114670727110736600665804098123416503841828789",
      "2661044082233456058396187727098375728375921643200540748303695324136976348253",
      "6096293672069786665857538772479257078181838217364432218857495446476026762057",
    ]; // Example

    merkleProofSource = {
      leaves: exampleGroupIdentityCommitments,
      depth: 20,
      leavesPerNode: 2,
    };
  }

  const generatedProof = await client?.request({
    method: RPCExternalAction.GENERATE_SEMAPHORE_PROOF,
    payload: {
      externalNullifier,
      signal,
      merkleProofSource,
    },
  });
};

export { genSemaphoreProof };
