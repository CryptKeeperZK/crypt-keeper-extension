/* eslint-disable no-console */
import { cryptkeeperConnect, type CryptKeeperInjectedProvider } from "@cryptkeeperzk/providers";
import { EventName } from "@cryptkeeperzk/providers";
import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { bigintToHex } from "bigint-conversion";
import { encodeBytes32String } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import type {
  ISemaphoreFullProof,
  IMerkleProofArtifacts,
  IRLNSNARKProof,
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

const merkleStorageAddress = `${SERVER_URL}/merkleProof`;

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
  client?: CryptKeeperInjectedProvider;
  proof?: ISemaphoreFullProof | IRLNSNARKProof | IMerkleProof;
  connectedCommitment?: string;
  connect: () => void;
  createIdentity: () => unknown;
  connectIdentity: () => Promise<void>;
  getConnectedIdentity: () => void;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
  joinGroup: () => Promise<void>;
  generareGroupMerkleProof: () => Promise<void>;
  revealConnectedIdentityCommitment: () => Promise<void>;
  newVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  newVerifiablePresentationRequest: () => Promise<void>;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const [client, setClient] = useState<CryptKeeperInjectedProvider>();
  const [isLocked, setIsLocked] = useState(true);
  const [proof, setProof] = useState<ISemaphoreFullProof | IRLNSNARKProof | IMerkleProof>();
  const [connectedCommitment, setConnectedIdentityCommitment] = useState<string>();
  const [connectedIdentityMetadata, setConnectedIdentityMetadata] = useState<ConnectedIdentityMetadata>();
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const connect = useCallback(async () => {
    const injectedClient = await cryptkeeperConnect();

    if (injectedClient) {
      setIsLocked(false);
      setClient(injectedClient);
    } else {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
    }
  }, [setIsLocked, setClient]);

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    let merkleProofArtifactsOrStorageAddress: string | IMerkleProofArtifacts = `${merkleStorageAddress}/Semaphore`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      merkleProofArtifactsOrStorageAddress = {
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
      ?.generateSemaphoreProof({ externalNullifier, signal, merkleProofArtifactsOrStorageAddress })
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
    let merkleProofArtifactsOrStorageAddress: string | IMerkleProofArtifacts = `${merkleStorageAddress}/RLN`;

    if (proofType === MerkleProofType.ARTIFACTS) {
      merkleProofArtifactsOrStorageAddress = {
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
      ?.rlnProof({ rlnIdentifier, message, epoch, merkleProofArtifactsOrStorageAddress, messageLimit, messageId })
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

  const newVerifiableCredentialRequest = useCallback(
    async (credentialType: string) => {
      const mockVerifiableCredential = genMockVerifiableCredential(credentialType);
      const verifiableCredentialJson = JSON.stringify(mockVerifiableCredential);

      await client?.DEV_newVerifiableCredentialRequest(verifiableCredentialJson);
    },
    [client],
  );

  const newVerifiablePresentationRequest = useCallback(async () => {
    const verifiablePresentationRequest = genMockVerifiablePresentationRequest();
    await client?.DEV_newVerifiablePresentationRequest(verifiablePresentationRequest);
  }, [client]);

  const getConnectedIdentity = useCallback(async () => {
    const payload = await client?.getConnectedIdentity();

    if (!payload) {
      return;
    }

    setConnectedIdentityMetadata(payload as unknown as ConnectedIdentityMetadata);

    toast(`Getting Identity data successfully!`, { type: "success" });
  }, [client, setConnectedIdentityMetadata]);

  const createIdentity = useCallback(() => {
    client?.createIdentity({ host: window.location.origin });
  }, [client]);

  const connectIdentity = useCallback(async () => {
    await client?.connectIdentity({ host: window.location.origin });
  }, [client]);

  const joinGroup = useCallback(async () => {
    await client?.joinGroup({
      groupId: GROUP_ID,
      apiKey: GROUP_API_KEY,
      inviteCode: GROUP_INVITE_CODE,
    });
  }, [client]);

  const generareGroupMerkleProof = useCallback(async () => {
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

  const onLogin = useCallback(() => {
    setIsLocked(false);
  }, [setIsLocked]);

  const onLogout = useCallback(() => {
    setConnectedIdentityMetadata(undefined);
    setIsLocked(true);
  }, [setConnectedIdentityMetadata, setIsLocked]);

  const onReject = useCallback(() => {
    toast(`User rejected request`, { type: "error" });
  }, []);

  const onRevealCommitment = useCallback(
    (data: unknown) => {
      setConnectedIdentityCommitment((data as { commitment: string }).commitment);
    },
    [setConnectedIdentityCommitment],
  );

  const onNewVerifiableCredential = useCallback((verifiableCredentialHash: unknown) => {
    toast(`Added a Verifiable Credential! ${verifiableCredentialHash as string}`, { type: "success" });
  }, []);

  const onNewVerifiablePresentation = useCallback((verifiablePresentation: unknown) => {
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

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    client.on(EventName.LOGIN, onLogin);
    client.on(EventName.IDENTITY_CHANGED, onIdentityChanged);
    client.on(EventName.LOGOUT, onLogout);
    client.on(EventName.NEW_VERIFIABLE_CREDENTIAL, onNewVerifiableCredential);
    client.on(EventName.NEW_VERIFIABLE_PRESENTATION, onNewVerifiablePresentation);
    client.on(EventName.USER_REJECT, onReject);
    client.on(EventName.REVEAL_COMMITMENT, onRevealCommitment);
    client.on(EventName.JOIN_GROUP, onJoinGroup);
    client.on(EventName.GROUP_MERKLE_PROOF, onGroupMerkleProof);

    getConnectedIdentity();

    return () => {
      client.cleanListeners();
    };
  }, [
    client,
    onLogout,
    onIdentityChanged,
    onLogin,
    onReject,
    onRevealCommitment,
    onGroupMerkleProof,
    onJoinGroup,
    onNewVerifiableCredential,
    onNewVerifiablePresentation,
  ]);

  return {
    client,
    isLocked,
    connectedIdentityMetadata,
    proof,
    connectedCommitment,
    connect,
    createIdentity,
    connectIdentity,
    getConnectedIdentity,
    genSemaphoreProof,
    genRLNProof,
    revealConnectedIdentityCommitment,
    joinGroup,
    generareGroupMerkleProof,
    newVerifiableCredentialRequest,
    newVerifiablePresentationRequest,
  };
};
