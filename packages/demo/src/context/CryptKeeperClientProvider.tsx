import { initializeCryptKeeper, type ICryptKeeperInjectedProvider, EventName, RPCExternalAction } from "@cryptkeeperzk/providers";
import type { ConnectedIdentityMetadata, IMerkleProof, IRLNFullProof, ISemaphoreFullProof, IVerifiablePresentation } from "@cryptkeeperzk/types";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import { toast } from "react-toastify";

interface IClientContext {
  client: ICryptKeeperInjectedProvider | undefined;
  connectedCommitment: string;
  connectedIdentityMetadata?: ConnectedIdentityMetadata;
  setConnectedIdentityCommitment: Dispatch<SetStateAction<string>>;
  setConnectedIdentityMetadata: Dispatch<SetStateAction<ConnectedIdentityMetadata>>;
  setClient: Dispatch<SetStateAction<ICryptKeeperInjectedProvider | undefined>>;
  getConnectedIdentityMetadata: () => Promise<void>
}

const ClientContext = createContext<IClientContext>({
  client: undefined,
  connectedCommitment: "",
  connectedIdentityMetadata: undefined,
  setConnectedIdentityCommitment: () => { },
  setConnectedIdentityMetadata: () => { },
  setClient: () => { },
  getConnectedIdentityMetadata: async () => {},
});

export const CryptKeeperClientProvider = ({ children }: PropsWithChildren<{}>) => {
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<ICryptKeeperInjectedProvider>();
  const [connectedCommitment, setConnectedIdentityCommitment] = useState<string>("");
  const [connectedIdentityMetadata, setConnectedIdentityMetadata] = useState<ConnectedIdentityMetadata>();
  const [proof, setProof] = useState<ISemaphoreFullProof | IRLNFullProof | IMerkleProof>();

  const getConnectedIdentityMetadata = useCallback(async () => {
    await client
      ?.request({
        method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA,
      })
      .then((connectedIdentity) => {
        if (connectedIdentity) {
          setConnectedIdentityMetadata(connectedIdentity as ConnectedIdentityMetadata);
          setIsConnected(true);
          toast(`Getting Identity Metadata Successfully!`, { type: "success" });
        }
      });
  }, [client, setConnectedIdentityMetadata, setIsConnected]);

  const onLogin = useCallback(() => {
    getConnectedIdentityMetadata();
  }, [getConnectedIdentityMetadata]);

  const onApproval = useCallback(
    (payload: unknown) => {
      const { isApproved } = payload as { isApproved: boolean };

      if (isApproved) {
        getConnectedIdentityMetadata();
      } else {
        setConnectedIdentityMetadata(undefined);
      }
    },
    [setConnectedIdentityMetadata, getConnectedIdentityMetadata],
  );

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
    setIsConnected(false);
  }, [setConnectedIdentityMetadata, setIsConnected]);

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
    client.on(EventName.APPROVAL, onApproval);
    client.on(EventName.ADD_VERIFIABLE_CREDENTIAL, onAddVerifiableCredential);
    client.on(EventName.GENERATE_VERIFIABLE_PRESENTATION, onGenerateVerifiablePresentation);
    client.on(EventName.USER_REJECT, onReject);
    client.on(EventName.REVEAL_COMMITMENT, onRevealCommitment);
    client.on(EventName.JOIN_GROUP, onJoinGroup);
    client.on(EventName.GROUP_MERKLE_PROOF, onGroupMerkleProof);
    client.on(EventName.IMPORT_IDENTITY, onImportIdentity);
    client.on(EventName.CREATE_IDENTITY, onCreateIdentity);

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
    onImportIdentity,
    onCreateIdentity,
    onApproval,
  ]);

  return (
    <ClientContext.Provider
      value={{
        client,
        connectedCommitment,
        connectedIdentityMetadata,
        setConnectedIdentityCommitment,
        setConnectedIdentityMetadata,
        setClient,
        getConnectedIdentityMetadata
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

export const useCryptKeeperClient = () => {
  return useContext(ClientContext);
};
