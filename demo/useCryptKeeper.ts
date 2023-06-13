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
  getIdentityCommitment: () => void;
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
    if (proofType === MerkleProofType.ARTIFACTS) {
      if (!mockIdentityCommitments.includes(connectedIdentity.commitment)) {
        mockIdentityCommitments.push(connectedIdentity.commitment);
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

      setProof(proof);
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
      if (!mockIdentityCommitments.includes(connectedIdentity.commitment)) {
        mockIdentityCommitments.push(connectedIdentity.commitment);
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

      setProof(proof);
      console.log("RLN proof generated successfully!", proof);
      toast("RLN proof generated successfully!", { type: "success" });
      toast.dismiss(toastId);
    } catch (e) {
      toast("Error while generating RLN proof!", { type: "error" });
      console.error(e);
    }
  };

  const getIdentityCommitment = useCallback(async () => {
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
    client?.createIdentity({ host: window.location.href });
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
    getIdentityCommitment();
  }, [setIsLocked, getIdentityCommitment]);

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

    return () => client?.cleanListeners();
  }, [client, onLogout, onIdentityChanged, onLogin]);

  return {
    client,
    isLocked,
    connectedIdentity,
    proof,
    connect,
    createIdentity,
    getIdentityCommitment,
    genSemaphoreProof,
    genRLNProof,
  };
};
