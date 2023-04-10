/* eslint-disable no-console */
import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { RLN } from "rlnjs";
import { bigintToHex } from "bigint-conversion";
import { Identity } from "@semaphore-protocol/identity";
import { encodeBytes32String } from "ethers";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { Client } from "../src/contentScripts/injected";

const SERVER_URL = "http://localhost:8090";

const merkleStorageAddress = `${SERVER_URL}/merkleProof`;

enum MerkleProofType {
  STORAGE_ADDRESS,
  ARTIFACTS,
}

declare global {
  interface Window {
    zkpr?: {
      connect: () => Promise<Client | null>;
    };
  }
}

// TODO: we should import this from CK types package @types/cryptkeeper
interface SelectedIdentity {
  commitment: string;
  web2Provider?: string;
}

const genMockIdentityCommitments = (): string[] => {
  const identityCommitments: string[] = [];
  for (let i = 0; i < 10; i++) {
    const mockIdentity = new Identity();
    const idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

interface INotConnectedProps {
  onClick: () => void;
}

function NotConnected({ onClick }: INotConnectedProps) {
  return (
    <div>
      Please connect to Crypt-Keeper to continue. <button onClick={onClick}>Connect</button>
    </div>
  );
}

function NoActiveIDCommitment() {
  return <div>Please set an active Identity Commitment in the Crypt-Keeper plugin to continue.</div>;
}

function App() {
  const [client, setClient] = useState<Client | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [selectedIdentity, setSelectedIdentity] = useState<SelectedIdentity>({
    commitment: "",
    web2Provider: "",
  });
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

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
    const payload: SelectedIdentity = await client?.getActiveIdentity();

    if (!payload) {
      return;
    }

    setSelectedIdentity({
      commitment: payload.commitment,
      web2Provider: payload.web2Provider,
    });

    toast(
      <div>
        <p>Getting Identity Commitment successfully! {payload.commitment}</p>
        <p>Identity Web2 Provider is {payload.web2Provider}</p>
      </div>,
      { type: "success" },
    );
  }, [client, setSelectedIdentity]);

  const createIdentity = useCallback(() => {
    client?.createIdentity();
  }, [client]);

  const initClient = useCallback(async () => {
    const client = await window.zkpr?.connect();

    if (client) {
      setClient(client);
      setIsLocked(false);
    }
  }, [setClient, setIsLocked]);

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

  useEffect(() => {
    if (!client) {
      initClient();
      return undefined;
    }

    getIdentityCommitment();

    client?.on("login", onLogin);
    client?.on("identityChanged", onIdentityChanged);
    client?.on("logout", onLogout);

    return () => {
      client?.off("login", onLogin);
      client?.off("identityChanged", onIdentityChanged);
      client?.off("logout", onLogout);
    };
  }, [Boolean(client), onLogout, onIdentityChanged, onLogin]);

  if (!client || isLocked) {
    return <NotConnected onClick={initClient} />;
  }

  if (!selectedIdentity) {
    console.log("identityCommitment", selectedIdentity);
    return <NoActiveIDCommitment />;
  }

  return (
    <div>
      <div>
        <h2>Semaphore</h2>
        <button onClick={() => genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS)}>
          Generate proof from Merkle proof storage address
        </button>{" "}
        <br />
        <br />
        <button onClick={() => genSemaphoreProof(MerkleProofType.ARTIFACTS)}>
          Generate proof from Merkle proof artifacts
        </button>
      </div>
      <hr />
      <div>
        <h2>RLN</h2>
        <button onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>
          Generate proof from Merkle proof storage address
        </button>{" "}
        <br />
        <br />
        <button onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>
          Generate proof from Merkle proof artifacts
        </button>
      </div>

      <hr />
      <div>
        <h2>Get Identity Commitment</h2>
        <button onClick={() => getIdentityCommitment()}>Get</button> <br />
        <br />
      </div>

      <hr />
      <div>
        <h2>Create a new Identity</h2>
        <button onClick={createIdentity}>Create</button> <br />
        <br />
      </div>

      <hr />
      <div>
        <h2>Identity commitment for active identity:</h2>
        <p>{selectedIdentity.commitment}</p>
      </div>

      <ToastContainer newestOnTop={true} />
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);
