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
  onConnectIdentity: () => void;
}

function NoConnectedIdentityCommitment({ onConnectIdentity }: NoConnectedIdentityCommitmentProps) {
  return (
    <div>
      Please set a connected identity in the Crypt-Keeper plugin to continue.{" "}
      <button data-testid="connect-identity" onClick={onConnectIdentity}>
        Connect identity
      </button>
    </div>
  );
}

function App() {
  const { client, isLocked, connectedIdentity, proof, connect, createIdentity, connectIdentity, genSemaphoreProof } =
    useCryptKeeper();

  useEffect(() => {
    connect();
  }, [connect]);

  if (!client || isLocked) {
    return <NotConnected onClick={connect} />;
  }

  if (!connectedIdentity?.commitment) {
    return <NoConnectedIdentityCommitment onConnectIdentity={connectIdentity} />;
  }

  return (
    <div>
      <hr />

      <div>
        <h2>Identity commitment for the connected identity:</h2>

        <p data-testid="connected-commitment">{connectedIdentity.commitment}</p>
      </div>

      <div>
        <h2>Host name for the connected identity:</h2>

        <p data-testid="connected-host">{connectedIdentity.host}</p>
      </div>

      <hr />

      <div>
        <h2>Create a new secret identity</h2>

        <button data-testid="create-new-identity" onClick={createIdentity}>
          Create
        </button>
      </div>

      <div>
        <h2>Connect your identity</h2>

        <button data-testid="connect-identity" onClick={connectIdentity}>
          Connect identity
        </button>
      </div>

      <hr />

      <div>
        <h2>Semaphore</h2>

        <button onClick={() => genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS)}>
          Generate proof from merkle proof storage address
        </button>

        <br />
        <br />

        <button onClick={() => genSemaphoreProof(MerkleProofType.ARTIFACTS)}>
          Generate proof from merkle proof artifacts
        </button>
      </div>

      <hr />

      <div>
        <h2>Semaphore proof output:</h2>

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
