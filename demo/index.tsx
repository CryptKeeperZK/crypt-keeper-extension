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
  const { isLocked, connectedIdentity, MerkleProofType, connect, createIdentity, genSemaphoreProof } = useCryptKeeper();

  if (!connectedIdentity || isLocked) {
    return <NotConnected onClick={connect} />;
  }

  // if (!connectedIdentity) {
  //   return <NoActiveIDCommitment />;
  // }

  return (
    <div>
      <hr />
      <div>
        <h2>Identity commitment for the connected identity:</h2>
        <p>{connectedIdentity.identityCommitment}</p>
      </div>

      <hr />
      <div>
        <h2>Host name for the connected identity:</h2>
        <p>{connectedIdentity.host}</p>
      </div>

      <hr />
      <div>
        <h2>Joined groups for the connected identity:</h2>
        <p>
          {connectedIdentity.groups.length === 0
            ? "No joined groups for this connected identity!"
            : (connectedIdentity.groups as unknown as string)}
        </p>
      </div>

      <hr />
      <div>
        <h2>Create a new secret Identity</h2>
        <button data-testid="create-new-identity" onClick={createIdentity}>
          Create
        </button>{" "}
        <br />
        <br />
      </div>

      <hr />
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

      {/* <hr />
      <div>
        <h2>Get Identity Commitment</h2>
        <button onClick={getIdentityCommitment}>Get</button> <br />
        <br />
      </div> */}

      <ToastContainer newestOnTop={true} />
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

root.render(<App />);
