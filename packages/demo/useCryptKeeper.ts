/* eslint-disable no-console */
import { useState, useEffect, useCallback } from "react";
import { RLN, RLNFullProof } from "rlnjs";
import { bigintToHex } from "bigint-conversion";
import { Identity } from "@semaphore-protocol/identity";
import { encodeBytes32String } from "ethers";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import type { CryptKeeperInjectedProvider, ConnectedIdentity, SemaphoreProof } from "./types";

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

const initializeClient = (): Promise<CryptKeeperInjectedProvider | undefined> => window.cryptkeeper?.connect();

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
    const client = await initializeClient();

    if (client) {
      setIsLocked(false);
      setClient(client);
    } else {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
    }
  }, [setIsLocked, setClient]);

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/Semaphore`;

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
      ?.semaphoreProof(externalNullifier, signal, storageAddressOrArtifacts)
      .then((proof) => {
        setProof(proof);
        toast("Semaphore proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating Semaphore proof!", { type: "error" });
        console.error(error);
      })
      .finally(() => toast.dismiss(toastId));
  };

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    const rlnIdentifier = RLN._genIdentifier();
    const rlnIdentifierHex = bigintToHex(rlnIdentifier);
    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/RLN`;

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
      .then((proof) => {
        setProof(proof);
        toast("RLN proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating RLN proof!", { type: "error" });
        console.error(error);
      })
      .finally(() => toast.dismiss(toastId));
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

    client?.on("login", onLogin);
    client?.on("identityChanged", onIdentityChanged);
    client?.on("logout", onLogout);

    getConnectedIdentity();

    return () => client?.cleanListeners();
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
