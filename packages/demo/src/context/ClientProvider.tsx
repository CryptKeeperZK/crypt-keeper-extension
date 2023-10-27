import { initializeCryptKeeper, type ICryptKeeperInjectedProvider } from '@cryptkeeperzk/providers';
import { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react';
import { toast } from 'react-toastify';

interface IClientContext {
  client: ICryptKeeperInjectedProvider | undefined;
  setClient: React.Dispatch<React.SetStateAction<ICryptKeeperInjectedProvider | undefined>>;
}

const ClientContext = createContext<IClientContext>({
  client: undefined,
  setClient: () => { }
});

export const ClientProvider = ({ children }: PropsWithChildren<{}>) => {
  const [client, setClient] = useState<ICryptKeeperInjectedProvider>();

  // Initialize Injected CryptKeeper Provider Client
  useEffect(() => {
    const cryptkeeperInjectedProvider = initializeCryptKeeper();

    if (cryptkeeperInjectedProvider) {
      setClient(cryptkeeperInjectedProvider);
    } else {
      toast(`CryptKeeper is not installed in the browser`, { type: "error" });
    }
  }, [setClient]);

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  return useContext(ClientContext);
};
