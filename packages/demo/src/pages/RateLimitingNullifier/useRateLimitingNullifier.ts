import { RPCExternalAction } from "@cryptkeeperzk/providers";
import { useState } from "react";
import { toast } from "react-toastify";

import { MERKLE_STORAGE_URL } from "@src/constants";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { MerkleProofType } from "@src/types";
import { genMockIdentityCommitments } from "@src/utils";

import type { IMerkleProofArtifacts, IRLNFullProof } from "@cryptkeeperzk/types";

interface IUseRateLimitingNullifierData {
  proof?: IRLNFullProof;
  genRLNProof: (proofType: MerkleProofType) => void;
}

export const useRateLimitingNullifier = (): IUseRateLimitingNullifierData => {
  const { client } = useCryptKeeperClient();
  const [proof, setProof] = useState<IRLNFullProof>();

  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const rlnIdentifier = "1";
    const message = "Hello RLN";
    const messageLimit = 1;
    const messageId = 0;
    const epoch = Date.now().toString();
    let merkleProofSource: string | IMerkleProofArtifacts = `${MERKLE_STORAGE_URL}/RLN`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      merkleProofSource = {
        leaves: mockIdentityCommitments,
        depth: 15,
        leavesPerNode: 2,
      };
    }

    const toastId = toast("Generating RLN proof...", {
      type: "info",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });

    await client
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
      })
      .then((generatedProof) => {
        setProof(generatedProof as IRLNFullProof);
        toast("RLN proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating RLN proof!", { type: "error" });
        // eslint-disable-next-line no-console
        console.error(error);
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  };

  return {
    proof,
    genRLNProof,
  };
};
