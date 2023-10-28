/* eslint-disable @typescript-eslint/no-empty-function */
import {
  initializeCryptKeeper,
  type ICryptKeeperInjectedProvider,
  EventName,
  RPCExternalAction,
} from "@cryptkeeperzk/providers";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { toast } from "react-toastify";

import type { ConnectedIdentityMetadata } from "@cryptkeeperzk/types";

interface IClientContext {
  client: ICryptKeeperInjectedProvider | undefined;
  isConnected: boolean;
  connectedCommitment: string;
  connectedIdentityMetadata?: ConnectedIdentityMetadata;
  setConnectedIdentityCommitment: Dispatch<SetStateAction<string>>;
  setConnectedIdentityMetadata: Dispatch<SetStateAction<ConnectedIdentityMetadata>>;
  setClient: Dispatch<SetStateAction<ICryptKeeperInjectedProvider | undefined>>;
  getConnectedIdentityMetadata: () => Promise<void>;
}

const ClientContext = createContext<IClientContext>({
  client: undefined,
  isConnected: false,
  connectedCommitment: "",
  connectedIdentityMetadata: undefined,
  setConnectedIdentityCommitment: () => {},
  setConnectedIdentityMetadata: () => {},
  setClient: () => {},
  getConnectedIdentityMetadata: async () => {},
});

export const CryptKeeperClientProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<ICryptKeeperInjectedProvider>();
  const [connectedCommitment, setConnectedIdentityCommitment] = useState<string>("");
  const [connectedIdentityMetadata, setConnectedIdentityMetadata] = useState<ConnectedIdentityMetadata>();

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

  const contextValues = useMemo(
    () => ({
      client,
      isConnected,
      connectedCommitment,
      connectedIdentityMetadata,
      setConnectedIdentityCommitment,
      setConnectedIdentityMetadata,
      setClient,
      getConnectedIdentityMetadata,
    }),
    [
      client,
      isConnected,
      connectedCommitment,
      connectedIdentityMetadata,
      setConnectedIdentityCommitment,
      setConnectedIdentityMetadata,
      setClient,
      getConnectedIdentityMetadata,
    ],
  );

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

  const onReject = useCallback(() => {
    toast(`User rejected request`, { type: "error" });
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
    client.on(EventName.USER_REJECT, onReject);
    client.on(EventName.CREATE_IDENTITY, onCreateIdentity);

    getConnectedIdentityMetadata();

    return () => {
      client.cleanListeners();
    };
  }, [client, onLogout, onIdentityChanged, onReject, onCreateIdentity, onApproval]);

  return <ClientContext.Provider value={contextValues}>{children}</ClientContext.Provider>;
};

export const useCryptKeeperClient = (): IClientContext => useContext(ClientContext);
/* eslint-enable @typescript-eslint/no-empty-function */
