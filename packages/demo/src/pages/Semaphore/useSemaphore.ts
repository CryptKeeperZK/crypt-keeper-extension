import { RPCExternalAction } from "@cryptkeeperzk/providers";
import { encodeBytes32String } from "ethers";
import { useState } from "react";
import { toast } from "react-toastify";

import { MERKLE_STORAGE_URL } from "@src/constants";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { MerkleProofType } from "@src/types";
import { genMockIdentityCommitments } from "@src/utils";

import type { IMerkleProofArtifacts, ISemaphoreFullProof } from "@cryptkeeperzk/types";

interface IUseSemaphoreData {
  proof?: ISemaphoreFullProof;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
}

export const useSemaphore = (): IUseSemaphoreData => {
  const { client } = useCryptKeeperClient();
  const [proof, setProof] = useState<ISemaphoreFullProof>();

  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    let merkleProofSource: string | IMerkleProofArtifacts = `${MERKLE_STORAGE_URL}/Semaphore`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      merkleProofSource = {
        leaves: mockIdentityCommitments,
        depth: 20,
        leavesPerNode: 2,
      };
    }

    const toastId = toast("Generating semaphore proof...", {
      type: "info",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });

    await client
      ?.request({
        method: RPCExternalAction.GENERATE_SEMAPHORE_PROOF,
        payload: {
          externalNullifier,
          signal,
          merkleProofSource,
        },
      })
      .then((generatedProof) => {
        setProof(generatedProof as ISemaphoreFullProof);
        toast("Semaphore proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating Semaphore proof!", { type: "error" });
        // eslint-disable-next-line no-console
        console.error(error);
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  };

  return {
    proof,
    genSemaphoreProof,
  };
};
