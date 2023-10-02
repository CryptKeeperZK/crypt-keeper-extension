/* eslint-disable no-console */
import { initializeCryptKeeper, ICryptKeeperInjectedProvider, EventName } from "@cryptkeeperzk/providers";
import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { bigintToHex } from "bigint-conversion";
import { encodeBytes32String } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import type {
  ISemaphoreFullProof,
  IMerkleProofArtifacts,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IVerifiableCredential,
  IVerifiablePresentation,
  IVerifiablePresentationRequest,
  IMerkleProof,
} from "@cryptkeeperzk/types";

const SERVER_URL = process.env.MERKLE_MOCK_SERVER;

const GROUP_ID = process.env.TEST_GROUP_ID!;
const GROUP_API_KEY = process.env.TEST_GROUP_API_KEY;
const GROUP_INVITE_CODE = process.env.TEST_GROUP_INVITE_CODE;

const merkleStorageUrl = `${SERVER_URL}/merkleProof`;

const genMockIdentityCommitments = (): string[] => {
  const identityCommitments: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const mockIdentity = new Identity();
    const idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

const genMockVerifiableCredential = (credentialType: string): IVerifiableCredential => {
  const mockVerifiableCredentialMap: Record<string, IVerifiableCredential> = {
    UniversityDegreeCredential: {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "http://example.edu/credentials/1872",
      type: ["VerifiableCredential", "UniversityDegreeCredential"],
      issuer: {
        id: "did:example:76e12ec712ebc6f1c221ebfeb1f",
      },
      issuanceDate: new Date("2010-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        claims: {
          type: "BachelorDegree",
          name: "Bachelor of Science and Arts",
        },
      },
    },
    DriversLicenseCredential: {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "http://example.edu/credentials/1873",
      type: ["VerifiableCredential", "DriversLicenseCredential"],
      issuer: {
        id: "did:example:76e12ec712ebc6f1c221ebfeb1e",
      },
      issuanceDate: new Date("2020-01-01T19:23:24Z"),
      credentialSubject: {
        id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
        claims: {
          name: "John Smith",
          licenseNumber: "123-abc",
        },
      },
    },
  };

  if (!(credentialType in mockVerifiableCredentialMap)) {
    throw new Error("Invalid credential type");
  }

  return mockVerifiableCredentialMap[credentialType];
};

const genMockVerifiablePresentationRequest = (): IVerifiablePresentationRequest => ({
  request: "Please provide your University Degree Credential AND Drivers License Credential.",
});

export enum MerkleProofType {
  STORAGE_ADDRESS,
  ARTIFACTS,
}

interface IUseCryptKeeperData {
  isLocked: boolean;
  connectedIdentityMetadata?: ConnectedIdentityMetadata;
  client?: ICryptKeeperInjectedProvider;
  proof?: ISemaphoreFullProof | IRLNFullProof | IMerkleProof;
  connectedCommitment?: string;
  connect: () => void;
  onLogin: () => void;
  getConnectedIdentityMetadata: () => void;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
  joinGroup: () => Promise<void>;
  generateGroupMerkleProof: () => Promise<void>;
  revealConnectedIdentityCommitment: () => Promise<void>;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const [client, setClient] = useState<ICryptKeeperInjectedProvider>();
  const [isLocked, setIsLocked] = useState(true);
  const [proof, setProof] = useState<ISemaphoreFullProof | IRLNFullProof | IMerkleProof>();
  const [connectedCommitment, setConnectedIdentityCommitment] = useState<string>();
  const [connectedIdentityMetadata, setConnectedIdentityMetadata] = useState<ConnectedIdentityMetadata>();
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const connect = useCallback(async () => {
    await client
      ?.connect()
      .then(() => {
        if (!connectedIdentityMetadata) {
          toast(`CryptKeeper connected successfully!`, { type: "success" });
        }
      })
      .catch((error: Error) => {
        toast(error.message, { type: "error" });
      });
  }, [client]);

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    let merkleProofSource: string | IMerkleProofArtifacts = `${merkleStorageUrl}/Semaphore`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      merkleProofSource = {
        leaves: mockIdentityCommitments,
        depth: 20,
        leavesPerNode: 2,
      };
    }

    const toastId = toast("Generating semaphore proof...", {
      type: "info",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });

    await client
      ?.generateSemaphoreProof({ externalNullifier, signal, merkleProofSource })
      .then((generatedProof) => {
        setProof(generatedProof);
        toast("Semaphore proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating Semaphore proof!", { type: "error" });
        console.error(error);
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  };

  const genRLNProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const rlnIdentifier = "1";
    const message = "Hello RLN";
    const messageLimit = 1;
    const messageId = 0;
    const epoch = Date.now().toString();
    let merkleProofSource: string | IMerkleProofArtifacts = `${merkleStorageUrl}/RLN`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      merkleProofSource = {
        leaves: mockIdentityCommitments,
        depth: 15,
        leavesPerNode: 2,
      };
    }

    const toastId = toast("Generating RLN proof...", {
      type: "info",
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
    });

    await client
      ?.generateRlnProof({
        rlnIdentifier,
        message,
        epoch,
        merkleProofSource,
        messageLimit,
        messageId,
      })
      .then((generatedProof) => {
        setProof(generatedProof);
        toast("RLN proof generated successfully!", { type: "success" });
      })
      .catch((error) => {
        toast("Error while generating RLN proof!", { type: "error" });
        console.error(error);
      })
      .finally(() => {
        toast.dismiss(toastId);
      });
  };

  const addVerifiableCredentialRequest = useCallback(
    async (credentialType: string) => {
      const mockVerifiableCredential = genMockVerifiableCredential(credentialType);
      const verifiableCredentialJson = JSON.stringify(mockVerifiableCredential);

      await client?.DEV_addVerifiableCredentialRequest(verifiableCredentialJson);
    },
    [client],
  );

  const generateVerifiablePresentationRequest = useCallback(async () => {
    const verifiablePresentationRequest = genMockVerifiablePresentationRequest();
    await client?.DEV_generateVerifiablePresentationRequest(verifiablePresentationRequest);
  }, [client]);

  const getConnectedIdentityMetadata = useCallback(async () => {
    await client?.getConnectedIdentity().then((connectedIdentity) => {
      if (connectedIdentity) {
        setConnectedIdentityMetadata(connectedIdentity);
        setIsLocked(false);
        toast(`Getting Identity Metadata Successfully!`, { type: "success" });
      }
    });
  }, [client, setConnectedIdentityMetadata, setIsLocked]);

  const joinGroup = useCallback(async () => {
    await client?.joinGroup({
      groupId: GROUP_ID,
      apiKey: GROUP_API_KEY,
      inviteCode: GROUP_INVITE_CODE,
    });
  }, [client]);

  const generateGroupMerkleProof = useCallback(async () => {
    await client?.generateGroupMerkleProof({
      groupId: GROUP_ID,
    });
  }, [client]);

  const revealConnectedIdentityCommitment = useCallback(async () => {
    await client?.revealConnectedIdentityRequest();
  }, [client]);

  const onIdentityChanged = useCallback(
    (payload: unknown) => {
      const metadata = payload as ConnectedIdentityMetadata;
      setConnectedIdentityMetadata(metadata);

      toast(`Identity has changed! ${metadata.name}`, {
        type: "success",
      });
    },
    [setConnectedIdentityMetadata],
  );

  const onLogout = useCallback(() => {
    setConnectedIdentityMetadata(undefined);
    setIsLocked(true);
  }, [setConnectedIdentityMetadata, setIsLocked]);

  const onAddVerifiableCredential = useCallback((verifiableCredentialHash: unknown) => {
    toast(`Added a Verifiable Credential! ${verifiableCredentialHash as string}`, { type: "success" });
  }, []);

  const onReject = useCallback(() => {
    toast(`User rejected request`, { type: "error" });
  }, []);

  const onRevealCommitment = useCallback(
    (data: unknown) => {
      setConnectedIdentityCommitment((data as { commitment: string }).commitment);
    },
    [setConnectedIdentityCommitment],
  );

  const onGenerateVerifiablePresentation = useCallback((verifiablePresentation: unknown) => {
    const credentialList = (verifiablePresentation as IVerifiablePresentation).verifiableCredential;
    const credentialCount = credentialList ? credentialList.length : 0;
    toast(`Generated a Verifiable Presentation from ${credentialCount} credentials!`, { type: "success" });
  }, []);

  const onJoinGroup = useCallback((data: unknown) => {
    const result = data as { groupId: string };
    toast(`User has joined the group. ${result.groupId}`, { type: "success" });
  }, []);

  const onGroupMerkleProof = useCallback(
    (data: unknown) => {
      const result = data as { merkleProof: IMerkleProof };
      setProof(result.merkleProof);
      toast("Group Merkle Proof has been successfully generated!", { type: "success" });
    },
    [setProof],
  );

  const onLogin = useCallback(() => {
    getConnectedIdentityMetadata();
  }, [client]);

  // Initialize Injected CryptKeeper Provider Client
  useEffect(() => {
    const cryptkeeperInjectedProvider = initializeCryptKeeper();

    if (cryptkeeperInjectedProvider) {
      setClient(cryptkeeperInjectedProvider);
    } else {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
    }
  }, [setClient]);

  // Listen to Injected CryptKeeper Provider Client Events
  useEffect(() => {
    if (!client) {
      return undefined;
    }

    client.on(EventName.LOGIN, onLogin);
    client.on(EventName.IDENTITY_CHANGED, onIdentityChanged);
    client.on(EventName.LOGOUT, onLogout);
    client.on(EventName.ADD_VERIFIABLE_CREDENTIAL, onAddVerifiableCredential);
    client.on(EventName.GENERATE_VERIFIABLE_PRESENTATION, onGenerateVerifiablePresentation);
    client.on(EventName.USER_REJECT, onReject);
    client.on(EventName.REVEAL_COMMITMENT, onRevealCommitment);
    client.on(EventName.JOIN_GROUP, onJoinGroup);
    client.on(EventName.GROUP_MERKLE_PROOF, onGroupMerkleProof);

    getConnectedIdentityMetadata();

    return () => {
      client.cleanListeners();
    };
  }, [
    client,
    onLogout,
    onIdentityChanged,
    onAddVerifiableCredential,
    onReject,
    onRevealCommitment,
    onGroupMerkleProof,
    onJoinGroup,
  ]);

  return {
    client,
    isLocked,
    connectedIdentityMetadata,
    proof,
    connectedCommitment,
    connect,
    onLogin,
    getConnectedIdentityMetadata,
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
    revealConnectedIdentityCommitment,
    joinGroup,
    generateGroupMerkleProof,
  };
};
