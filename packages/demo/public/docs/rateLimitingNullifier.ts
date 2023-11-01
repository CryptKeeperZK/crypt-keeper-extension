import { initializeCryptKeeper, RPCExternalAction } from "@cryptkeeperzk/providers";

import { MerkleProofType } from "@src/types";

import type { IMerkleProofArtifacts } from "@cryptkeeperzk/types";

const client = initializeCryptKeeper();

interface IGenerateRLNProofParams {
  proofType: MerkleProofType;
  rlnIdentifier: string;
  message: string;
  messageLimit: number;
  messageId: number;
  epoch: string;
}

const genRLNProof = async ({
  proofType, // STORAGE_ADDRESS or ARTIFACTS
  rlnIdentifier = "1", // Example
  message = "Hello RLN", // Example
  messageLimit = 1, // Example
  messageId = 0, // Example
  epoch = Date.now().toString(), // Example
}: IGenerateRLNProofParams): Promise<void> => {
  let merkleProofSource: string | IMerkleProofArtifacts = `<HTTP/S_LINK>`;

  if (proofType === MerkleProofType.ARTIFACTS) {
    const groupIdentityCommitments: string[] = [
      "80877997493538069559805206308114670727110736600665804098123416503841828789",
      "2661044082233456058396187727098375728375921643200540748303695324136976348253",
      "6096293672069786665857538772479257078181838217364432218857495446476026762057",
    ]; // Example

    merkleProofSource = {
      leaves: groupIdentityCommitments,
      depth: 15,
      leavesPerNode: 2,
    };
  }

  const generatedProof = await client
    ?.request({
      method: RPCExternalAction.GENERATE_RLN_PROOF,
      payload: {
        rlnIdentifier,
        message,
        messageId,
        messageLimit,
        epoch,
        merkleProofSource,
      },
    });
};

export { genRLNProof };
