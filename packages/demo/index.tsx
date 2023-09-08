import dotenv from "dotenv";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import path from "path";

import { MerkleProofType, useCryptKeeper } from "./useCryptKeeper";

dotenv.config({ path: path.resolve(__dirname, "../..", ".env"), override: true });

interface INotConnectedProps {
  onClick: () => void;
}

const NotConnected = ({ onClick }: INotConnectedProps) => (
  <div>
    <p style={{ marginRight: 8 }}>Please connect to Crypt-Keeper to continue.</p>

    <button type="button" onClick={onClick}>
      Connect
    </button>

    <ToastContainer newestOnTop />
  </div>
);

interface NoConnectedIdentityCommitmentProps {
  onConnectIdentity: () => void;
}

const NoConnectedIdentityCommitment = ({ onConnectIdentity }: NoConnectedIdentityCommitmentProps) => (
  <div>
    <p style={{ marginRight: 8 }}>Please set a connected identity in the Crypt-Keeper plugin to continue.</p>

    <button data-testid="connect-identity" type="button" onClick={onConnectIdentity}>
      Connect identity
    </button>
  </div>
);

const App = () => {
  const {
    client,
    isLocked,
    connectedIdentityMetadata,
    proof,
    connectedCommitment,
    connect,
    createIdentity,
    connectIdentity,
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    onRevealConnectedIdentityCommitment,
  } = useCryptKeeper();

  useEffect(() => {
    connect();
  }, [connect]);

  if (!client || isLocked) {
    return <NotConnected onClick={connect} />;
  }

  if (!connectedIdentityMetadata) {
    return <NoConnectedIdentityCommitment onConnectIdentity={connectIdentity} />;
  }

  return (
    <div>
      <hr />

      <div>
        <h2>Connected identity:</h2>

        {connectedCommitment && (
          <div>
            <strong>Commitment:</strong>

            <p data-testid="commitment">{connectedCommitment}</p>
          </div>
        )}

        <div>
          <strong>Name:</strong>

          <p data-testid="connected-name">{connectedIdentityMetadata.name}</p>
        </div>

        <div>
          <strong>Strategy:</strong>

          <p data-testid="connected-strategy">{connectedIdentityMetadata.identityStrategy}</p>
        </div>

        {connectedIdentityMetadata.web2Provider && (
          <div>
            <strong>Web2 Provider:</strong>

            <p data-testid="connected-web2-provider">{connectedIdentityMetadata.web2Provider}</p>
          </div>
        )}

        <div>
          <strong>Host:</strong>

          <p data-testid="connected-host">{connectedIdentityMetadata.host}</p>
        </div>
      </div>

      <hr />

      <div>
        <h2>Create a new secret identity</h2>

        <button data-testid="create-new-identity" type="button" onClick={createIdentity}>
          Create
        </button>
      </div>

      <div>
        <h2>Connect your identity</h2>

        <button data-testid="connect-identity" type="button" onClick={connectIdentity}>
          Connect identity
        </button>
      </div>

      {process.env.REVEAL_IDENTITY === "true" && (
        <div>
          <h2>Reveal connected identity Commitment</h2>

          <button
            data-testid="reveal-connected-identity-commitment"
            type="button"
            onClick={onRevealConnectedIdentityCommitment}
          >
            Reveal
          </button>
        </div>
      )}

      <hr />

      <div>
        <h2>Semaphore</h2>

        <button
          type="button"
          onClick={() => {
            genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS);
          }}
        >
          Generate proof from Merkle proof storage address
        </button>

        <br />

        <br />

        <button
          type="button"
          onClick={() => {
            genSemaphoreProof(MerkleProofType.ARTIFACTS);
          }}
        >
          Generate proof from Merkle proof artifacts
        </button>
      </div>

      <hr />

      <div>
        <h2>Rate-Limiting Nullifier</h2>

        <div>
          <button
            type="button"
            onClick={() => {
              genRLNProof(MerkleProofType.STORAGE_ADDRESS);
            }}
          >
            Generate proof from Merkle proof storage address
          </button>

          <br />

          <br />

          <button
            type="button"
            onClick={() => {
              genRLNProof(MerkleProofType.ARTIFACTS);
            }}
          >
            Generate proof from Merkle proof artifacts
          </button>
        </div>
      </div>

      <hr />

      <div>
        <h2>Generated proof output:</h2>

        <div>
          <pre data-testid="proof-json">{JSON.stringify(proof, null, 2)}</pre>
        </div>
      </div>

      <hr />

      {process.env.VERIFIABLE_CREDENTIALS === "true" && (
        <div>
          <h2>Verifiable Credentials</h2>

          <button data-testid="add-verifiable-credential" type="button" onClick={addVerifiableCredentialRequest}>
            Add a Verifiable Credential
          </button>
        </div>
      )}

      <ToastContainer newestOnTop />
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(<App />);
