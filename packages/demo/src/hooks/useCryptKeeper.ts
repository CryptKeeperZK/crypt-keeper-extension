/* eslint-disable no-console */
import {
  initializeCryptKeeper,
  ICryptKeeperInjectedProvider,
  EventName,
  RPCExternalAction,
} from "@cryptkeeperzk/providers";
import { encodeBytes32String } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { MERKLE_STORAGE_URL } from "@src/constants";
import { MerkleProofType } from "@src/types";
import {
  genMockIdentityCommitments,
  genMockVerifiableCredential,
  genMockVerifiablePresentationRequest,
} from "@src/utils";

import type {
  ISemaphoreFullProof,
  IMerkleProofArtifacts,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IVerifiablePresentation,
  IMerkleProof,
} from "@cryptkeeperzk/types";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";

interface IUseCryptKeeperData {
  client?: ICryptKeeperInjectedProvider;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
  joinGroup: () => Promise<void>;
  generateGroupMerkleProof: () => Promise<void>;
  revealConnectedIdentityCommitment: () => Promise<void>;
  importIdentity: () => Promise<void>;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const { client } = useCryptKeeperClient();

  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    // const externalNullifier = encodeBytes32String("voting-1");
    // const signal = encodeBytes32String("hello-world");
    // let merkleProofSource: string | IMerkleProofArtifacts = `${MERKLE_STORAGE_URL}/Semaphore`;

    // if (proofType === MerkleProofType.ARTIFACTS) {
    //   merkleProofSource = {
    //     leaves: mockIdentityCommitments,
    //     depth: 20,
    //     leavesPerNode: 2,
    //   };
    // }

    // const toastId = toast("Generating semaphore proof...", {
    //   type: "info",
    //   hideProgressBar: true,
    //   closeOnClick: true,
    //   pauseOnHover: false,
    // });

    // await client
    //   ?.request({
    //     method: RPCExternalAction.GENERATE_SEMAPHORE_PROOF,
    //     payload: {
    //       externalNullifier,
    //       signal,
    //       merkleProofSource,
    //     },
    //   })
    //   .then((generatedProof) => {
    //     setProof(generatedProof as ISemaphoreFullProof);
    //     toast("Semaphore proof generated successfully!", { type: "success" });
    //   })
    //   .catch((error) => {
    //     toast("Error while generating Semaphore proof!", { type: "error" });
    //     console.error(error);
    //   })
    //   .finally(() => {
    //     toast.dismiss(toastId);
    //   });
  };

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    // const rlnIdentifier = "1";
    // const message = "Hello RLN";
    // const messageLimit = 1;
    // const messageId = 0;
    // const epoch = Date.now().toString();
    // let merkleProofSource: string | IMerkleProofArtifacts = `${MERKLE_STORAGE_URL}/RLN`;

    // if (proofType === MerkleProofType.ARTIFACTS) {
    //   merkleProofSource = {
    //     leaves: mockIdentityCommitments,
    //     depth: 15,
    //     leavesPerNode: 2,
    //   };
    // }

    // const toastId = toast("Generating RLN proof...", {
    //   type: "info",
    //   hideProgressBar: true,
    //   closeOnClick: true,
    //   pauseOnHover: false,
    // });

    // await client
    //   ?.request({
    //     method: RPCExternalAction.GENERATE_RLN_PROOF,
    //     payload: {
    //       rlnIdentifier,
    //       message,
    //       messageId,
    //       messageLimit,
    //       epoch,
    //       merkleProofSource,
    //     },
    //   })
    //   .then((generatedProof) => {
    //     setProof(generatedProof as IRLNFullProof);
    //     toast("RLN proof generated successfully!", { type: "success" });
    //   })
    //   .catch((error) => {
    //     toast("Error while generating RLN proof!", { type: "error" });
    //     console.error(error);
    //   })
    //   .finally(() => {
    //     toast.dismiss(toastId);
    //   });
  };

  const addVerifiableCredentialRequest = useCallback(
    async (credentialType: string) => {
      const mockVerifiableCredential = genMockVerifiableCredential(credentialType);
      const verifiableCredentialJson = JSON.stringify(mockVerifiableCredential);

      await client?.request({
        method: RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL,
        payload: verifiableCredentialJson,
      });
    },
    [client],
  );

  const generateVerifiablePresentationRequest = useCallback(async () => {
    const verifiablePresentationRequest = genMockVerifiablePresentationRequest();
    await client?.request({
      method: RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      payload: verifiablePresentationRequest,
    });
  }, [client]);

  const joinGroup = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.JOIN_GROUP,
      payload: {
        groupId: process.env.TEST_GROUP_ID!,
        apiKey: process.env.TEST_GROUP_API_KEY,
        inviteCode: process.env.TEST_GROUP_INVITE_CODE,
      },
    });
  }, [client]);

  const generateGroupMerkleProof = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF,
      payload: {
        groupId: process.env.TEST_GROUP_ID!,
      },
    });
  }, [client]);

  const revealConnectedIdentityCommitment = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
    });
  }, [client]);

  const importIdentity = useCallback(async () => {
    const trapdoor = (document.getElementById("trapdoor") as HTMLInputElement | null)?.value ?? undefined;
    const nullifier = (document.getElementById("nullifier") as HTMLInputElement | null)?.value ?? undefined;

    await client?.request({
      method: RPCExternalAction.IMPORT_IDENTITY,
      payload: {
        trapdoor,
        nullifier,
      },
    });
  }, [client]);

  return {
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
    revealConnectedIdentityCommitment,
    joinGroup,
    generateGroupMerkleProof,
    importIdentity,
  };
};
