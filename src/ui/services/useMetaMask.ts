// Singleton initialization
import { MetaMaskInpageProvider } from "@dimensiondev/metamask-extension-provider";
import { WalletInfoBackgound } from "@src/types";
import { EthersProvider, MetaMaskProviderService } from "@src/web3-providers";
import log from "loglevel";
import { useCallback, useEffect } from "react";
import { setAccount, setBalance, setChainId, setNetwork, setWeb3Connecting } from "../ducks/web3";
import { useReduxDispatch } from "./ReduxConnector";

const metamaskProviderService: MetaMaskProviderService = new MetaMaskProviderService();
const metamaskProvider: MetaMaskInpageProvider = metamaskProviderService.getMetamaskProvider;
const ethersProivder: EthersProvider = metamaskProviderService.getEthersProvider;

export async function useMetaMaskConnect() {
  useReduxDispatch(setWeb3Connecting(true));

  try {
    await metamaskProviderService?.connectMetaMask();
    await useMetaMaskWalletInfo();

    useMetaMaskEvents();
  } catch (error) {
    throw new Error(`Error in connecting to metamask ${error}`);
  } finally {
    useReduxDispatch(setWeb3Connecting(false));
  }
}

export function useMetaMaskEvents(): void {
  const handleAccountChange = useCallback(
    async (accounts: any) => {
      log.debug("Inside MetaMaskProvider accountsChanged: ", accounts);
      if (ethersProivder) {
        const balance = await ethersProivder.getAccountBalance(accounts[0] as string);
        useReduxDispatch(setAccount(accounts[0] as string));
        useReduxDispatch(setBalance(balance));
      }
    },
    [ethersProivder],
  );

  const handleChainChange = useCallback(async () => {
    log.debug("Inside MetaMaskProvider chainChanged");

    if (ethersProivder) {
      const { name: networkName, chainId } = await ethersProivder.getNetworkDetails();

      if (networkName) {
        useReduxDispatch(setNetwork(networkName));
      }

      if (chainId) {
        useReduxDispatch(setChainId(chainId));
      }
    }
  }, [ethersProivder]);

  const handleError = useCallback((e: unknown) => {
    log.debug("Inside MetaMaskProvider  error: ", e);
    throw e as Error;
  }, []);

  const handleConnect = useCallback(() => {
    log.debug("Inside MetaMaskProvider  connect");
  }, []);

  const handleDisconnect = useCallback(() => {
    log.debug("Inside MetaMaskProvider  disconnect");
  }, []);

  useEffect(() => {
    metamaskProvider?.on("accountsChanged", handleAccountChange);
    metamaskProvider?.on("chainChanged", handleChainChange);
    metamaskProvider?.on("error", handleError);
    metamaskProvider?.on("connect", handleConnect);
    metamaskProvider?.on("disconnect", handleDisconnect);
  }, [metamaskProvider, handleAccountChange, handleChainChange, handleError, handleConnect, handleDisconnect]);
}

export async function useMetaMaskWalletInfo(): Promise<WalletInfoBackgound | null> {
  if (metamaskProviderService) {
    log.debug("useMetaMaskWalletInfo 1");
    const walletInfo = await metamaskProviderService.getWalletInfo();
    log.debug(`useMetaMaskWalletInfo 1 walletInfo ${walletInfo}`);
    if (walletInfo) {
      useReduxDispatch(setAccount(walletInfo.account));
      useReduxDispatch(setBalance(walletInfo.balance));
      useReduxDispatch(setNetwork(walletInfo.networkName));
      useReduxDispatch(setChainId(walletInfo.chainId));
    }

    return walletInfo;
  }

  log.debug(`useMetaMaskWalletInfo metamaskProviderService ${metamaskProviderService}`);

  return null;
}

export async function useMetaMaskSignature(message: string): Promise<string | null> {
  const walletInfo = await useMetaMaskWalletInfo();

  return walletInfo ? metamaskProviderService?.getSignature(walletInfo.signer, message) ?? null : null;
}
