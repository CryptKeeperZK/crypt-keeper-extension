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
  onGetConnectedIdentity: () => void;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
}

const NotConnected = ({ onClick, onGetConnectedIdentity, genSemaphoreProof }: INotConnectedProps) => (
  <div>
    <h2>Start the Authorization Process</h2>

    <p style={{ marginRight: 8 }}>Please connect to CryptKeeper to continue.</p>

    <button type="button" onClick={onClick}>
      Connect Identity
    </button>

    <hr />

    <div>
      <h2>Example of Unauthorized Actions</h2>

      <button type="button" onClick={onGetConnectedIdentity}>
        Get Connected Identity
      </button>

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

    <ToastContainer newestOnTop />
  </div>
);

const App = () => {
  const {
    isLocked,
    connectedIdentityMetadata,
    proof,
    connectedCommitment,
    connectIdentity,
    getConnectedIdentity,
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
    revealConnectedIdentityCommitment,
    joinGroup,
    generareGroupMerkleProof,
  } = useCryptKeeper();

  useEffect(() => {
    connectIdentity();
  }, [connectIdentity]);

  if (isLocked) {
    return (
      <NotConnected
        genSemaphoreProof={genSemaphoreProof}
        onClick={connectIdentity}
        onGetConnectedIdentity={getConnectedIdentity}
      />
    );
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

          <p data-testid="connected-name">{connectedIdentityMetadata?.name}</p>
        </div>

        <div>
          <strong>Host:</strong>

          <p data-testid="connected-urlOrigin">{connectedIdentityMetadata?.urlOrigin}</p>
        </div>
      </div>

      <hr />

      <div>
        <h2>Get Connected Identity Metadata</h2>

        <button type="button" onClick={getConnectedIdentity}>
          Get Connected Identity
        </button>
      </div>

      <div>
        <h2>Reveal connected identity Commitment</h2>

        <button
          data-testid="reveal-connected-identity-commitment"
          type="button"
          onClick={revealConnectedIdentityCommitment}
        >
          Reveal
        </button>
      </div>

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
        <h2>Generate bandada group proof</h2>

        <div>
          <button type="button" onClick={generareGroupMerkleProof}>
            Generate Group Merkle Proof
          </button>
        </div>

        <br />

        <div>
          <button type="button" onClick={joinGroup}>
            Join test group
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

          <button
            data-testid="add-verifiable-credential"
            type="button"
            onClick={() => addVerifiableCredentialRequest("UniversityDegreeCredential")}
          >
            Add a University Degree Verifiable Credential
          </button>

          <br />

          <br />

          <button
            data-testid="add-verifiable-credential"
            type="button"
            onClick={() => addVerifiableCredentialRequest("DriversLicenseCredential")}
          >
            Add a Drivers License Verifiable Credential
          </button>

          <br />

          <br />

          <button data-testid="add-verifiable-credential" type="button" onClick={generateVerifiablePresentationRequest}>
            Generate a Verifiable Presentation
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
