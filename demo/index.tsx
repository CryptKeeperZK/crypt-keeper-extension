import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { RLN } from "rlnjs/src";
import { bigintToHex } from "bigint-conversion";
import { Identity } from "@semaphore-protocol/identity";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import log from "loglevel";
import { genExternalNullifier } from "rlnjs/src/utils";

const semaphorePath = {
  circuitFilePath: "http://localhost:8095/semaphore/semaphore.wasm",
  zkeyFilePath: "http://localhost:8095/semaphore/semaphore_final.zkey",
};

const rlnPath = {
  circuitFilePath: "http://localhost:8095/rln/rln.wasm",
  zkeyFilePath: "http://localhost:8095/rln/rln_final.zkey",
  verificationKey: "http://localhost:8095/rln/verification_key.json"
};

const merkleStorageAddress = "http://localhost:8090/merkleProof";

enum MerkleProofType {
  STORAGE_ADDRESS,
  ARTIFACTS,
}

const genMockIdentityCommitments = (): string[] => {
  let identityCommitments: string[] = [];
  for (let i = 0; i < 10; i++) {
    const mockIdentity = new Identity();
    let idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

function NotConnected() {
  return <div>Please connect to Crypt-Keeper to continue.</div>;
}

function NoActiveIDCommitment() {
  return <div>Please set an active Identity Commitment in the Crypt-Keeper plugin to continue.</div>;
}

function App() {
  const [client, setClient] = useState();
  const [isLocked, setIsLocked] = useState(true);
  const [identityCommitment, setIdentityCommitment] = useState("");
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = genExternalNullifier("voting-1");
    const signal = "0x111";

    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/Semaphore`;
    if (proofType === MerkleProofType.ARTIFACTS) {
      if (!mockIdentityCommitments.includes(identityCommitment)) {
        mockIdentityCommitments.push(identityCommitment);
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

      const proof = await client?.semaphoreProof(
        externalNullifier,
        signal,
        semaphorePath.circuitFilePath,
        semaphorePath.zkeyFilePath,
        storageAddressOrArtifacts,
      );

      log.debug(`Semaphore proof generated successfully! \n
            - Public Signals: 
            \t ${JSON.stringify(proof.fullProof.publicSignals, null, 1)}
            - fullProof: 
            \t ${JSON.stringify(proof.fullProof.proof, null, 1)}
        `);
      toast(`Semaphore proof generated successfully!`, { type: "success" });
    } catch (e) {
      log.debug("ERROR", e);
      toast("Error while generating Semaphore proof!", { type: "error" });
      console.error(e);
    }

    toast.dismiss(toastId);
  };

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = genExternalNullifier("voting-1");
    const signal = "0x111";
    const rlnIdentifier = RLN._genIdentifier();
    const rlnIdentifierHex = bigintToHex(rlnIdentifier);

    let storageAddressOrArtifacts: any = `${merkleStorageAddress}/RLN`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      if (!mockIdentityCommitments.includes(identityCommitment)) {
        mockIdentityCommitments.push(identityCommitment);
      }

      storageAddressOrArtifacts = {
        leaves: mockIdentityCommitments,
        depth: 15,
        leavesPerNode: 2,
      };
    }

    let circuitPath = rlnPath.circuitFilePath;
    let zkeyFilePath = rlnPath.zkeyFilePath;
    let verificationKey = rlnPath.verificationKey;

    let toastId;
    try {
      toastId = toast("Generating RLN proof...", {
        type: "info",
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      });

      const proof = await client?.rlnProof(
        externalNullifier,
        signal,
        circuitPath,
        zkeyFilePath,
        storageAddressOrArtifacts,
        rlnIdentifierHex,
      );

      log.debug(`RLN proof generated successfully! \n
            - Public Signals: 
            \t ${JSON.stringify(proof.publicSignals, null, 1)}
            - fullProof: 
            \t ${JSON.stringify(proof.proof, null, 1)}
        `);
      toast(`RLN proof generated successfully! ${proof}`, { type: "success" });
    } catch (e) {
      log.debug("ERROR", e);
      toast("Error while generating RLN proof!", { type: "error" });
      console.error(e);
    }
    toast.dismiss(toastId);
  };

  const getIdentityCommitment = async () => {
    const idCommitment = await client?.getActiveIdentity();
    toast(`Getting Identity Commitment successfully! ${idCommitment}`, { type: "success" });
    setIdentityCommitment(idCommitment);
  };

  useEffect(() => {
    (async function IIFE() {
      initClient();

      if (client) {
        await getIdentityCommitment();
        await client?.on("identityChanged", idCommitment => {
          setIdentityCommitment(idCommitment);
        });

        await client?.on("logout", async () => {
          setIdentityCommitment("");
          setIsLocked(true);
        });

        await client?.on("login", async () => {
          setIsLocked(false);
          await getIdentityCommitment();
        });
      }
    })();
  }, [client]);

  const initClient = async () => {
    const { zkpr } = window as any;
    const client = await zkpr.connect();
    setClient(client);
    setIsLocked(false);
  };

  return (
    <div>
      {!client || isLocked ? (
        <NotConnected />
      ) : identityCommitment === "" || identityCommitment === null ? (
        <NoActiveIDCommitment />
      ) : (
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
            <button disabled onClick={() => genRLNProof(MerkleProofType.STORAGE_ADDRESS)}>
              Generate proof from Merkle proof storage address
            </button>{" "}
            <br />
            <br />
            <button disabled onClick={() => genRLNProof(MerkleProofType.ARTIFACTS)}>
              Generate proof from Merkle proof artifacts
            </button>
          </div>

          <hr />
          <div>
            <h2>Get identity commitment</h2>
            <button onClick={() => getIdentityCommitment()}>Get</button> <br />
            <br />
          </div>

          <hr />
          <div>
            <h2>Identity commitment for active identity:</h2>
            <p>{identityCommitment}</p>
          </div>

          <ToastContainer newestOnTop={true} />
        </div>
      )}
    </div>
  );
}

const root = document.getElementById("root");

ReactDOM.render(<App />, root);
