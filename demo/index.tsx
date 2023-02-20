import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { RLN, genExternalNullifier } from "rlnjs";
import { bigintToHex } from "bigint-conversion";
import { Identity } from "@semaphore-protocol/identity";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import log from "loglevel";

const semaphorePath = {
  circuitFilePath: "http://localhost:8095/semaphore/semaphore.wasm",
  zkeyFilePath: "http://localhost:8095/semaphore/semaphore.zkey",
  verificationKey: "http://localhost:8095/semaphore/verification_key.json",
};

const rlnPath = {
  circuitFilePath: "http://localhost:8095/rln/rln.wasm",
  zkeyFilePath: "http://localhost:8095/rln/rln.zkey",
  verificationKey: "http://localhost:8095/rln/verification_key.json",
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

      console.log("Semaphore proof generated successfully!", proof);
      toast(`Semaphore proof generated successfully!`, { type: "success" });
    } catch (e) {
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

      console.log("RLN proof generated successfully!", proof);
      toast("RLN proof generated successfully!", { type: "success" });
    } catch (e) {
      toast("Error while generating RLN proof!", { type: "error" });
      console.error(e);
    }
    toast.dismiss(toastId);
  };

  const getIdentityCommitment = useCallback(async () => {
    const idCommitment = await client?.getActiveIdentity();
    toast(`Getting Identity Commitment successfully! ${idCommitment}`, { type: "success" });
    setIdentityCommitment(idCommitment);
  }, [client, setIdentityCommitment]);

  const initClient = useCallback(async () => {
    const { zkpr } = window as any;

    if (!zkpr) {
      log.warn("zkpr is not defined");
      return;
    }

    const client = await zkpr.connect();
    setClient(client);
    setIsLocked(false);
  }, [setClient, setIsLocked]);

  const onIdentityChanged = useCallback(
    (idCommitment: string) => {
      setIdentityCommitment(idCommitment);
    },
    [setIdentityCommitment],
  );

  const onLogin = useCallback(() => {
    setIsLocked(false);
    getIdentityCommitment();
  }, [setIsLocked, getIdentityCommitment]);

  const onLogout = useCallback(() => {
    setIdentityCommitment("");
    setIsLocked(true);
  }, [setIdentityCommitment, setIsLocked]);

  useEffect(() => {
    if (!client) {
      initClient();
    }
  }, [Boolean(client), initClient]);

  useEffect(() => {
    if (!client) {
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

  if (!identityCommitment) {
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
  );
}

const root = document.getElementById("root");

ReactDOM.render(<App />, root);
