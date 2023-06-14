import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";

import { MerkleProofType, useCryptKeeper } from "./useCryptKeeper";

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

interface NoConnectedIdentityCommitmentProps {
  onCreateIdentity: () => void;
}

function NoConnectedIdentityCommitment({ onCreateIdentity }: NoConnectedIdentityCommitmentProps) {
  return (
    <div>
      <p>Please set a connected identity in the Crypt-Keeper plugin to continue.</p>

      <button data-testid="create-new-identity" onClick={onCreateIdentity}>
        Create identity
      </button>
    </div>
  );
}

function App() {
  const { client, isLocked, connectedIdentity, proof, connect, createIdentity, genSemaphoreProof } = useCryptKeeper();

  useEffect(() => {
    connect();
  }, [connect]);

  if (!client || isLocked) {
    return <NotConnected onClick={connect} />;
  }

  if (!connectedIdentity?.commitment) {
    return <NoConnectedIdentityCommitment onCreateIdentity={createIdentity} />;
  }

  return (
    <div>
      <hr />

      <div>
        <h2>Identity commitment for the connected identity:</h2>

        <p>{connectedIdentity.commitment}</p>
      </div>

      <div>
        <h2>Host name for the connected identity:</h2>

        <p>{connectedIdentity.host}</p>
      </div>

      <hr />

      <div>
        <h2>Create a new secret Identity</h2>

        <button data-testid="create-new-identity" onClick={createIdentity}>
          Create
        </button>
      </div>

      <hr />

      <div>
        <h2>Semaphore</h2>

        <button onClick={() => genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS)}>
          Generate proof from Merkle proof storage address
        </button>

        <br />
        <br />

        <button onClick={() => genSemaphoreProof(MerkleProofType.ARTIFACTS)}>
          Generate proof from Merkle proof artifacts
        </button>
      </div>

      <hr />

      <div>
        <h2>Semaphore Proof output:</h2>

        <div>
          <pre>{JSON.stringify(proof, null, 2)}</pre>
        </div>
      </div>

      {/* <div>
        <h2>RLN</h2>
        <button onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>
          Generate proof from Merkle proof storage address
        </button>{" "}
        <br />
        <br />
        <button onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>
          Generate proof from Merkle proof artifacts
        </button>
      </div> */}

      <ToastContainer newestOnTop={true} />
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);
