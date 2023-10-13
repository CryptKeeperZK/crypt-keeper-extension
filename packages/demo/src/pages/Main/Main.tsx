import { ToastContainer } from "react-toastify";

import { Bandada } from "../../components/Bandada/Bandada";
import { Connect } from "../../components/Connect/Connect";
import { ConnectedIdentity } from "../../components/ConnectedIdentity/ConnectedIdentity";
import { DisplayProof } from "../../components/DisplayProof/DisplayProof";
import { GetCommitment } from "../../components/GetComitment/GetComitment";
import { GetMetadata } from "../../components/GetMetadata/GetMetadata";
import { RateLimitingNullifier } from "../../components/RateLimitingNullifier/RateLimitingNullifier";
import { Semaphore } from "../../components/Semaphore/Semaphore";
import { VerifiableCredentials } from "../../components/VerifiableCredentials/VerifiableCredentials";
import { useCryptKeeper } from "../../hooks/useCryptKeeper";

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
