/* eslint-disable no-console */
import { cryptkeeperConnect, type CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";
import { Identity } from "@semaphore-protocol/identity";
import { bigintToHex } from "bigint-conversion";
import { encodeBytes32String } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { RLN } from "rlnjs";

import type { ConnectedIdentity, SemaphoreProof, RLNFullProof, MerkleProofArtifacts } from "@cryptkeeperzk/types";

const SERVER_URL = "http://localhost:8090";

const merkleStorageAddress = `${SERVER_URL}/merkleProof`;

const genMockIdentityCommitments = (): string[] => {
  const identityCommitments: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const mockIdentity = new Identity();
    const idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

export enum MerkleProofType {
  STORAGE_ADDRESS,
  ARTIFACTS,
}

interface IUseCryptKeeperData {
  isLocked: boolean;
  connectedIdentity: ConnectedIdentity;
  client?: CryptKeeperInjectedProvider;
  proof?: SemaphoreProof | RLNFullProof;
  connect: () => void;
  createIdentity: () => unknown;
  connectIdentity: () => Promise<void>;
  getConnectedIdentity: () => void;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const [client, setClient] = useState<CryptKeeperInjectedProvider>();
  const [isLocked, setIsLocked] = useState(true);
  const [proof, setProof] = useState<SemaphoreProof | RLNFullProof>();
  const [connectedIdentity, setConnectedIdentity] = useState<ConnectedIdentity>({
    commitment: "",
    web2Provider: "",
    host: "",
  });
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const connect = useCallback(async () => {
    const injectedClient = await cryptkeeperConnect();

    if (injectedClient) {
      setIsLocked(false);
      setClient(injectedClient);
    } else {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
    }
  }, [setIsLocked, setClient]);

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    let storageAddressOrArtifacts: string | MerkleProofArtifacts = `${merkleStorageAddress}/Semaphore`;

    if (!mockIdentityCommitments.includes(connectedIdentity.commitment)) {
      mockIdentityCommitments.push(connectedIdentity.commitment);
    }

    if (proofType === MerkleProofType.ARTIFACTS) {
      storageAddressOrArtifacts = {
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
      ?.generateSemaphoreProof(externalNullifier, signal, storageAddressOrArtifacts)
      .then((generatedProof) => {
        setProof(generatedProof as SemaphoreProof);
        toast("Semaphore proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating Semaphore proof!", { type: "error" });
        console.error(error);
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  };

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    // eslint-disable-next-line no-underscore-dangle
    const rlnIdentifier = RLN._genIdentifier();
    const rlnIdentifierHex = bigintToHex(rlnIdentifier);
    let storageAddressOrArtifacts: string | MerkleProofArtifacts = `${merkleStorageAddress}/RLN`;

    if (!mockIdentityCommitments.includes(connectedIdentity.commitment)) {
      mockIdentityCommitments.push(connectedIdentity.commitment);
    }

    if (proofType === MerkleProofType.ARTIFACTS) {
      storageAddressOrArtifacts = {
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
      ?.rlnProof(externalNullifier, signal, storageAddressOrArtifacts, rlnIdentifierHex)
      .then((generatedProof) => {
        setProof(generatedProof);
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

  const getConnectedIdentity = useCallback(async () => {
    const payload = await client?.getConnectedIdentity();

    if (!payload) {
      return;
    }

    setConnectedIdentity({
      commitment: payload.commitment,
      web2Provider: payload.web2Provider,
      host: payload.host,
    });

    toast(`Getting Identity Commitment successfully! ${payload.commitment}`, { type: "success" });
  }, [client, setConnectedIdentity]);

  const createIdentity = useCallback(() => {
    client?.createIdentity({ host: window.location.origin });
  }, [client]);

  const connectIdentity = useCallback(async () => {
    await client?.connectIdentity({ host: window.location.origin });
  }, [client]);

  const onIdentityChanged = useCallback(
    (payload: unknown) => {
      const { commitment, web2Provider, host } = payload as ConnectedIdentity;

      setConnectedIdentity({ commitment, web2Provider, host });
      toast(`Identity has changed! ${commitment}`, { type: "success" });
    },
    [setConnectedIdentity],
  );

  const onLogin = useCallback(() => {
    setIsLocked(false);
  }, [setIsLocked]);

  const onLogout = useCallback(() => {
    setConnectedIdentity({
      commitment: "",
      web2Provider: "",
      host: "",
    });
    setIsLocked(true);
  }, [setConnectedIdentity, setIsLocked]);

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    client.on("login", onLogin);
    client.on("identityChanged", onIdentityChanged);
    client.on("logout", onLogout);

    getConnectedIdentity();

    return () => {
      client.cleanListeners();
    };
  }, [client, onLogout, onIdentityChanged, onLogin]);

  return {
    client,
    isLocked,
    connectedIdentity,
    proof,
    connect,
    createIdentity,
    connectIdentity,
    getConnectedIdentity,
    genSemaphoreProof,
    genRLNProof,
  };
};
