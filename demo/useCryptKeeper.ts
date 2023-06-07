/* eslint-disable no-console */
import { useState, useEffect, useCallback } from "react";
import { RLN } from "rlnjs";
import { bigintToHex } from "bigint-conversion";
import { Identity } from "@semaphore-protocol/identity";
import { encodeBytes32String } from "ethers";
import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { ConnectedIdentityData, CryptKeeperInjectedProvider, SelectedIdentity } from "./types";

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
  proof: unknown;
  connectedIdentity: ConnectedIdentityData;
  MerkleProofType: typeof MerkleProofType;
  connect: () => void;
  createIdentity: () => unknown;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const [client, setClient] = useState<CryptKeeperInjectedProvider>();
  const [isLocked, setIsLocked] = useState(true);
  const [proof, setProof] = useState<unknown>();
  const [connectedIdentity, setConnectedIdentity] = useState<ConnectedIdentityData>({
    identityCommitment: "",
    host: "",
    groups: [],
  });
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const initializeCryptKeeper = useCallback(() => {
    const { cryptkeeper } = window;

    if (!cryptkeeper) {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
      return;
    }

    console.log(`cryptkeeper`, cryptkeeper);
    console.log(`cryptkeeper.connect`, cryptkeeper.connect);

    const client = cryptkeeper;

    setClient(client);
  }, [setClient]);

  const connect = useCallback(async () => {
    if (!client) {
      toast(`CryptKeeper failed to be initialized`, { type: "error" });
      return;
    }

    try {
      const connectedIdentityData = await client.connect();
      toast(`CryptKeeper: Identity connected successfully!`, { type: "success" });
      setConnectedIdentity(connectedIdentityData);
      setIsLocked(false);
    } catch (error) {
      toast(`${error}`, { type: "error" });
    }
  }, [setConnectedIdentity, setIsLocked, client]);

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");

    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/Semaphore`;
    if (proofType === MerkleProofType.ARTIFACTS) {
      if (!mockIdentityCommitments.includes(connectedIdentity.identityCommitment)) {
        mockIdentityCommitments.push(connectedIdentity.identityCommitment);
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
      setProof(proof);
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
      if (!mockIdentityCommitments.includes(connectedIdentity.identityCommitment)) {
        mockIdentityCommitments.push(connectedIdentity.identityCommitment);
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

  // TODO: `cryptkeeper.requestIdentityCommitment()` outside of the scope of this PR
  // const getIdentityCommitment = useCallback(async () => {
  //   const payload = await client?.getActiveIdentity();

  //   if (!payload) {
  //     return;
  //   }

  //   setConnectedIdentity({
  //     commitment: payload.commitment,
  //     web2Provider: payload.web2Provider,
  //   });

  //   toast(`Getting Identity Commitment successfully! ${payload.commitment}`, { type: "success" });
  // }, [client, setConnectedIdentity]);

  const createIdentity = useCallback(() => {
    client?.createIdentity();
  }, [client]);

  // TODO: `identityChanged` event is outside of the scope of this PR.
  // const onIdentityChanged = useCallback(
  //   (payload: unknown) => {
  //     const { commitment, web2Provider } = payload as SelectedIdentity;

  //     setConnectedIdentity({ commitment, web2Provider });
  //     toast(`Identity has changed! ${commitment}`, { type: "success" });
  //   },
  //   [setConnectedIdentity],
  // );

  // const onLogin = useCallback(() => {
  //   setIsLocked(false);
  //   getIdentityCommitment();
  // }, [setIsLocked, getIdentityCommitment]);

  const onLogout = useCallback(() => {
    setConnectedIdentity({
      identityCommitment: "",
      host: "",
      groups: [],
    });
    setIsLocked(true);
  }, [setConnectedIdentity, setIsLocked]);

  useEffect(() => {
    initializeCryptKeeper();
  }, [initializeCryptKeeper, setClient]);

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    // client?.on("login", onLogin);
    // client?.on("identityChanged", onIdentityChanged);
    client?.on("logout", onLogout);

    return () => client?.cleanListeners();
  }, [client, onLogout, setProof]);

  return {
    client,
    isLocked,
    proof,
    connectedIdentity,
    MerkleProofType,
    connect,
    createIdentity,
    genSemaphoreProof,
    genRLNProof,
  };
};
