import { encodeBytes32String } from "ethers";
import { RPCExternalAction } from "@cryptkeeperzk/providers";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useCallback, useState } from "react";
import { MerkleProofType } from "@src/types";
import type { IMerkleProofArtifacts, IRLNFullProof, ISemaphoreFullProof } from "@cryptkeeperzk/types";
import { MERKLE_STORAGE_URL } from "@src/constants";
import { genMockIdentityCommitments } from "@src/utils";
import { toast } from "react-toastify";

interface IUseRateLimitingNullifierData {
    proof?: IRLNFullProof,
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
            console.error(error);
          })
          .finally(() => {
            toast.dismiss(toastId);
          });
      };


    return {
        proof,
        genRLNProof
    }
};
