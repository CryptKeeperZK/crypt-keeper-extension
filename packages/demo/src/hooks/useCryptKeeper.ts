/* eslint-disable no-console */
import {
  initializeCryptKeeper,
  ICryptKeeperInjectedProvider,
  EventName,
  RPCExternalAction,
} from "@cryptkeeperzk/providers";
import { encodeBytes32String } from "ethers";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { MERKLE_STORAGE_URL } from "@src/constants";
import { MerkleProofType } from "@src/types";
import {
  genMockIdentityCommitments,
  genMockVerifiableCredential,
  genMockVerifiablePresentationRequest,
} from "@src/utils";

import type {
  ISemaphoreFullProof,
  IMerkleProofArtifacts,
  IRLNFullProof,
  ConnectedIdentityMetadata,
  IVerifiablePresentation,
  IMerkleProof,
  IIdentityConnection,
} from "@cryptkeeperzk/types";

interface IUseCryptKeeperData {
  isLocked: boolean;
  connectedIdentityMetadata?: ConnectedIdentityMetadata;
  client?: ICryptKeeperInjectedProvider;
  proof?: ISemaphoreFullProof | IRLNFullProof | IMerkleProof;
  connectedCommitment?: string;
  connect: (isChangeIdentity: boolean) => void;
  onLogin: () => void;
  getConnectedIdentityMetadata: () => void;
  genSemaphoreProof: (proofType: MerkleProofType) => void;
  genRLNProof: (proofType: MerkleProofType) => void;
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
  joinGroup: () => Promise<void>;
  generateGroupMerkleProof: () => Promise<void>;
  revealConnectedIdentityCommitment: () => Promise<void>;
  importIdentity: () => Promise<void>;
}

export const useCryptKeeper = (): IUseCryptKeeperData => {
  const [client, setClient] = useState<ICryptKeeperInjectedProvider>();
  const [isLocked, setIsLocked] = useState(true);
  const [proof, setProof] = useState<ISemaphoreFullProof | IRLNFullProof | IMerkleProof>();
  const [connectedCommitment, setConnectedIdentityCommitment] = useState<string>();
  const [connectedIdentityMetadata, setConnectedIdentityMetadata] = useState<IIdentityConnection>();
  const mockIdentityCommitments: string[] = genMockIdentityCommitments();

  const connect = useCallback(
    async (isChangeIdentity = false) => {
      await client?.connect(isChangeIdentity).catch((error: Error) => {
        toast(error.message, { type: "error" });
      });
    },
    [client],
  );

  const genSemaphoreProof = async (proofType: MerkleProofType = MerkleProofType.STORAGE_ADDRESS) => {
    const externalNullifier = encodeBytes32String("voting-1");
    const signal = encodeBytes32String("hello-world");
    let merkleProofSource: string | IMerkleProofArtifacts = `${MERKLE_STORAGE_URL}/Semaphore`;

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
      ?.request({
        method: RPCExternalAction.GENERATE_SEMAPHORE_PROOF,
        payload: {
          externalNullifier,
          signal,
          merkleProofSource,
        },
      })
      .then((generatedProof) => {
        setProof(generatedProof as ISemaphoreFullProof);
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
    let merkleProofSource: string | IMerkleProofArtifacts = `${MERKLE_STORAGE_URL}/RLN`;

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
      ?.request({
        method: RPCExternalAction.GENERATE_RLN_PROOF,
        payload: {
          rlnIdentifier,
          message,
          messageId,
          messageLimit,
          epoch,
          merkleProofSource,
        },
      })
      .then((generatedProof) => {
        setProof(generatedProof as IRLNFullProof);
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

      await client?.request({
        method: RPCExternalAction.ADD_VERIFIABLE_CREDENTIAL,
        payload: verifiableCredentialJson,
      });
    },
    [client],
  );

  const generateVerifiablePresentationRequest = useCallback(async () => {
    const verifiablePresentationRequest = genMockVerifiablePresentationRequest();
    await client?.request({
      method: RPCExternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      payload: verifiablePresentationRequest,
    });
  }, [client]);

  const getConnectedIdentityMetadata = useCallback(async () => {
    await client
      ?.request({
        method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA,
      })
      .then((connectedIdentity) => {
        if (connectedIdentity) {
          setConnectedIdentityMetadata(connectedIdentity as IIdentityConnection);
          setIsLocked(false);
          toast(`Getting Identity Metadata Successfully!`, { type: "success" });
        }
      });
  }, [client, setConnectedIdentityMetadata, setIsLocked]);

  const joinGroup = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.JOIN_GROUP,
      payload: {
        groupId: process.env.TEST_GROUP_ID!,
        apiKey: process.env.TEST_GROUP_API_KEY,
        inviteCode: process.env.TEST_GROUP_INVITE_CODE,
      },
    });
  }, [client]);

  const generateGroupMerkleProof = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.GENERATE_GROUP_MERKLE_PROOF,
      payload: {
        groupId: process.env.TEST_GROUP_ID!,
      },
    });
  }, [client]);

  const revealConnectedIdentityCommitment = useCallback(async () => {
    await client?.request({
      method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
    });
  }, [client]);

  const importIdentity = useCallback(async () => {
    const trapdoor = (document.getElementById("trapdoor") as HTMLInputElement | null)?.value ?? undefined;
    const nullifier = (document.getElementById("nullifier") as HTMLInputElement | null)?.value ?? undefined;

    await client?.request({
      method: RPCExternalAction.IMPORT_IDENTITY,
      payload: {
        trapdoor,
        nullifier,
      },
    });
  }, [client]);

  const onLogout = useCallback(() => {
    setConnectedIdentityMetadata(undefined);
    setIsLocked(true);
  }, [setConnectedIdentityMetadata, setIsLocked]);

  const onAddVerifiableCredential = useCallback((payload: unknown) => {
    const { verifiableCredentialHash } = payload as { verifiableCredentialHash: string };

    toast(`Added a Verifiable Credential! ${verifiableCredentialHash}`, { type: "success" });
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

  const onGenerateVerifiablePresentation = useCallback((payload: unknown) => {
    const {
      verifiablePresentation: { verifiableCredential: credentialList },
    } = payload as { verifiablePresentation: IVerifiablePresentation };
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

  const onImportIdentity = useCallback((payload: unknown) => {
    toast(`Identity has been imported ${JSON.stringify(payload)}`, { type: "success" });
  }, []);

  const onCreateIdentity = useCallback((payload: unknown) => {
    toast(`Identity has been created ${JSON.stringify(payload)}`, { type: "success" });
  }, []);

  const onLogin = useCallback(() => {
    getConnectedIdentityMetadata();
  }, [getConnectedIdentityMetadata]);

  const onApproval = useCallback(
    (payload: unknown) => {
      const { isApproved } = payload as { isApproved: boolean };

      if (isApproved) {
        getConnectedIdentityMetadata();
      } else {
        setIsLocked(true);
        setConnectedIdentityMetadata(undefined);
      }
    },
    [setIsLocked, setConnectedIdentityMetadata, getConnectedIdentityMetadata],
  );

  const onConnect = useCallback(
    (payload: unknown) => {
      setConnectedIdentityMetadata(payload as IIdentityConnection);
      setIsLocked(false);
    },
    [setConnectedIdentityMetadata, setIsLocked],
  );

  const onDisconnect = useCallback(() => {
    setConnectedIdentityMetadata(undefined);
    setIsLocked(true);
  }, [setIsLocked, setConnectedIdentityMetadata]);

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
    client.on(EventName.LOGOUT, onLogout);
    client.on(EventName.APPROVAL, onApproval);
    client.on(EventName.ADD_VERIFIABLE_CREDENTIAL, onAddVerifiableCredential);
    client.on(EventName.GENERATE_VERIFIABLE_PRESENTATION, onGenerateVerifiablePresentation);
    client.on(EventName.USER_REJECT, onReject);
    client.on(EventName.REVEAL_COMMITMENT, onRevealCommitment);
    client.on(EventName.JOIN_GROUP, onJoinGroup);
    client.on(EventName.GROUP_MERKLE_PROOF, onGroupMerkleProof);
    client.on(EventName.IMPORT_IDENTITY, onImportIdentity);
    client.on(EventName.CREATE_IDENTITY, onCreateIdentity);
    client.on(EventName.CONNECT, onConnect);
    client.on(EventName.DISCONNECT, onDisconnect);

    getConnectedIdentityMetadata();

    return () => {
      client.cleanListeners();
    };
  }, [
    client,
    getConnectedIdentityMetadata,
    onLogout,
    onAddVerifiableCredential,
    onReject,
    onRevealCommitment,
    onGroupMerkleProof,
    onJoinGroup,
    onImportIdentity,
    onCreateIdentity,
    onApproval,
    onConnect,
    onDisconnect,
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
    importIdentity,
  };
};
