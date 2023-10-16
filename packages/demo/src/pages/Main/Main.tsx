import { ToastContainer } from "react-toastify";

import Bandada from "@src/components/Bandada";
import Connect from "@src/components/Connect";
import ConnectedIdentity from "@src/components/ConnectedIdentity";
import DisplayProof from "@src/components/DisplayProof";
import GetCommitment from "@src/components/GetCommitment";
import GetMetadata from "@src/components/GetMetadata";
import RateLimitingNullifier from "@src/components/RateLimitingNullifier";
import Semaphore from "@src/components/Semaphore";
import VerifiableCredentials from "@src/components/VerifiableCredentials";
import { useCryptKeeper } from "@src/hooks/useCryptKeeper";

export const Main = (): JSX.Element => {
  const {
    isLocked,
    connectedIdentityMetadata,
    proof,
    connectedCommitment,
    getConnectedIdentityMetadata,
    connect,
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
    revealConnectedIdentityCommitment,
    joinGroup,
    generateGroupMerkleProof,
  } = useCryptKeeper();

  if (isLocked) {
    return (
      <div>
        <h2>Start the Authorization Process</h2>

        <Connect connect={connect} isChangeIdentity={false} title="Please connect to CryptKeeper to continue." />

        <hr />

        <div>
          <h2>Example of Unauthorized Actions</h2>

          <br />

          <Semaphore genSemaphoreProof={genSemaphoreProof} />
        </div>

        <hr />

        <ToastContainer newestOnTop />
      </div>
    );
  }

  return (
    <div>
      <hr />

      <ConnectedIdentity
        identityCommitment={connectedCommitment}
        identityHost={connectedIdentityMetadata?.urlOrigin}
        identityName={connectedIdentityMetadata?.name}
      />

      <hr />

      <Connect isChangeIdentity connect={connect} title="Connect identity" />

      <GetMetadata getConnectedIdentityMetadata={getConnectedIdentityMetadata} />

      <GetCommitment revealConnectedIdentityCommitment={revealConnectedIdentityCommitment} />

      <hr />

      <Semaphore genSemaphoreProof={genSemaphoreProof} />

      <hr />

      <RateLimitingNullifier genRLNProof={genRLNProof} />

      <hr />

      <Bandada generateGroupMerkleProof={generateGroupMerkleProof} joinGroup={joinGroup} />

      <hr />

      <DisplayProof proof={proof} />

      <hr />

      {process.env.VERIFIABLE_CREDENTIALS === "true" && (
        <VerifiableCredentials
          addVerifiableCredentialRequest={addVerifiableCredentialRequest}
          generateVerifiablePresentationRequest={generateVerifiablePresentationRequest}
        />
      )}

      <ToastContainer newestOnTop />
    </div>
  );
};
