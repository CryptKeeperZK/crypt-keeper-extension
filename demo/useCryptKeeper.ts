/* eslint-disable no-console */
import { useState, useEffect, useCallback } from "react";
import { RLN } from "rlnjs";
import { bigintToHex } from "bigint-conversion";
import { Identity } from "@semaphore-protocol/identity";
import { encodeBytes32String } from "ethers";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

// TODO: convert this after finishing from publishing `@cryptkeeper/providers` package
import { CryptKeeperInjectedProvider } from "@cryptkeeper/providers";
// TODO: convert this after finishing from publishing `@cryptkeeper/providers` package and export the used types
// import { SelectedIdentity } from "@cryptkeeper/types";
interface SelectedIdentity {
    commitment: string;
    web2Provider?: string;
}

const SERVER_URL = "http://localhost:8090";

const merkleStorageAddress = `${SERVER_URL}/merkleProof`;

const genMockIdentityCommitments = (): string[] => {
  const identityCommitments: string[] = [];
  for (let i = 0; i < 10; i++) {
    const mockIdentity = new Identity();
    const idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

enum MerkleProofType {
  STORAGE_ADDRESS,
  ARTIFACTS,
}

interface IUseCryptKeeperData {
  client?: CryptKeeperInjectedProvider;
  isLocked: boolean;
  selectedIdentity: SelectedIdentity;
  MerkleProofType: typeof MerkleProofType;
  connect: () => void;
  createIdentity: () => unknown;
  getIdentityCommitment: () => void;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const [client, setClient] = useState<CryptKeeperInjectedProvider>();
  const [isLocked, setIsLocked] = useState(true);
  const [selectedIdentity, setSelectedIdentity] = useState<SelectedIdentity>({
    commitment: "",
    web2Provider: "",
  });
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const connect = useCallback(async () => {
    await client?.connect();
    setIsLocked(false);
  }, [client]);

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");

    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/Semaphore`;
    if (proofType === MerkleProofType.ARTIFACTS) {
      if (!mockIdentityCommitments.includes(selectedIdentity.commitment)) {
        mockIdentityCommitments.push(selectedIdentity.commitment);
      }
      storageAddressOrArtifacts = {
        leaves: mockIdentityCommitments,
        depth: 20,
        leavesPerNode: 2,
      };
    }

    let toastId;
    try {
      toastId = toast("Generating semaphore proof...", {
        type: "info",
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      });

      const proof = await client?.semaphoreProof(externalNullifier, signal, storageAddressOrArtifacts);

      console.log("Semaphore proof generated successfully!", proof);
      toast("Semaphore proof generated successfully!", { type: "success" });
    } catch (e) {
      toast("Error while generating Semaphore proof!", { type: "error" });
      console.error(e);
    }

    toast.dismiss(toastId);
  };

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    const rlnIdentifier = RLN._genIdentifier();
    const rlnIdentifierHex = bigintToHex(rlnIdentifier);

    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/RLN`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      if (!mockIdentityCommitments.includes(selectedIdentity.commitment)) {
        mockIdentityCommitments.push(selectedIdentity.commitment);
      }

      storageAddressOrArtifacts = {
        leaves: mockIdentityCommitments,
        depth: 15,
        leavesPerNode: 2,
      };
    }

    try {
      const toastId = toast("Generating RLN proof...", {
        type: "info",
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      });

      const proof = await client?.rlnProof(externalNullifier, signal, storageAddressOrArtifacts, rlnIdentifierHex);

      console.log("RLN proof generated successfully!", proof);
      toast("RLN proof generated successfully!", { type: "success" });
      toast.dismiss(toastId);
    } catch (e) {
      toast("Error while generating RLN proof!", { type: "error" });
      console.error(e);
    }
  };

  const getIdentityCommitment = useCallback(async () => {
    const payload = await client?.getActiveIdentity();

    if (!payload) {
      return;
    }

    setSelectedIdentity({
      commitment: payload.commitment,
      web2Provider: payload.web2Provider,
    });

    toast(`Getting Identity Commitment successfully! ${payload.commitment}`, { type: "success" });
  }, [client, setSelectedIdentity]);

  const createIdentity = useCallback(() => {
    client?.createIdentity();
  }, [client]);

  const onIdentityChanged = useCallback(
    (payload: unknown) => {
      const { commitment, web2Provider } = payload as SelectedIdentity;

      setSelectedIdentity({ commitment, web2Provider });
      toast(`Identity has changed! ${commitment}`, { type: "success" });
    },
    [setSelectedIdentity],
  );

  const onLogin = useCallback(() => {
    setIsLocked(false);
    getIdentityCommitment();
  }, [setIsLocked, getIdentityCommitment]);

  const onLogout = useCallback(() => {
    setSelectedIdentity({
      commitment: "",
      web2Provider: "",
    });
    setIsLocked(true);
  }, [setSelectedIdentity, setIsLocked]);

  // Connect to CK
  useEffect(() => {
    const { cryptkeeper } = window;

    if (!cryptkeeper) {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
      return undefined;
    }

    if (!client) {
      setClient(cryptkeeper);
    }

    client?.on("login", onLogin);
    client?.on("identityChanged", onIdentityChanged);
    client?.on("logout", onLogout);

    return () => {
        client?.cleanListeners();
    }
  }, [Boolean(client), onLogout, onIdentityChanged, onLogin, setClient, setIsLocked]);

  return {
    client,
    isLocked,
    selectedIdentity,
    MerkleProofType,
    connect,
    createIdentity,
    getIdentityCommitment,
    genSemaphoreProof,
    genRLNProof,
  };
};
