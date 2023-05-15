/* eslint-disable no-console */
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";

import { useCryptKeeper } from "./useCryptKeeper";

import "react-toastify/dist/ReactToastify.css";

interface INotConnectedProps {
  onClick: () => void;
}

function NotConnected({ onClick }: INotConnectedProps) {
  return (
    <div>
      Please connect to Crypt-Keeper to continue. <button onClick={onClick}>Connect</button>
      <ToastContainer newestOnTop={true} />
    </div>
  );
}

function NoActiveIDCommitment() {
  return <div>Please set an active Identity Commitment in the Crypt-Keeper plugin to continue.</div>;
}

function App() {
  const {
    client,
    isLocked,
    selectedIdentity,
    MerkleProofType,
    connect,
    createIdentity,
    getIdentityCommitment,
    genSemaphoreProof,
    genRLNProof,
  } = useCryptKeeper();

  useEffect(() => {
    connect();
  }, [connect]);

  if (!client || isLocked) {
    return <NotConnected onClick={connect} />;
  }

  if (!selectedIdentity) {
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
