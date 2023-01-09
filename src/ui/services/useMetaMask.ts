// Singleton initialization
import { MetaMaskInpageProvider } from "@dimensiondev/metamask-extension-provider";
import { WalletInfoBackgound } from "@src/types";
import { EthersProvider, MetaMaskProviderService } from "@src/web3-providers";
import { setAccount, setBalance, setChainId, setNetwork, setWeb3Connecting } from "../ducks/web3";
import { useReduxDispatch } from "./ReduxConnector";

let metamaskProviderService: MetaMaskProviderService | null = null;
let metamaskProvider: MetaMaskInpageProvider | null = null;
let ethersProivder: EthersProvider | null = null;

export function useMetaMaskService() {
  if (!metamaskProvider) {
    if (!ethersProivder) {
      metamaskProviderService = new MetaMaskProviderService();
      metamaskProvider = metamaskProviderService.getMetamaskProvider;
      ethersProivder = metamaskProviderService.getEthersProvider;
    }
  }
}

export async function useMetaMaskConnect() {
  useReduxDispatch(setWeb3Connecting(true));

  useMetaMaskService();
  try {
    await metamaskProviderService?.connectMetaMask();
    await useMetaMaskWalletInfo();

    useMetaMaskEvents();

    useReduxDispatch(setWeb3Connecting(false));
  } catch (error) {
    throw new Error(`Error in connecting to metamask ${error}`);
  }
}

export function useMetaMaskEvents(): void {
  metamaskProvider?.on("accountsChanged", async (account: any) => {
    console.log("Inside MetaMaskProvider accountsChanged: ", account);
    if (ethersProivder) {
      const balance = await ethersProivder.getAccountBalance(account[0]);
      useReduxDispatch(setAccount(account[0]));
      useReduxDispatch(setBalance(balance));
    }
  });

  metamaskProvider?.on("chainChanged", async () => {
    console.log("Inside MetaMaskProvider chainChanged");

    if (ethersProivder) {
      const networkDetails = await ethersProivder.getNetworkDetails();
      const networkName = networkDetails.name;
      const chainId = networkDetails.chainId;

      if (networkName) useReduxDispatch(setNetwork(networkName));
      if (chainId) useReduxDispatch(setChainId(chainId));
    }
  });

  metamaskProvider?.on("error", (e: any) => {
    console.log("Inside MetaMaskProvider  error: ", e);
    throw e;
  });

  metamaskProvider?.on("connect", () => {
    console.log("Inside MetaMaskProvider  connect");
  });

  metamaskProvider?.on("disconnect", () => {
    console.log("Inside MetaMaskProvider  disconnect");
  });
}

export async function useMetaMaskWalletInfo(): Promise<WalletInfoBackgound | null> {
  if (metamaskProviderService) {
    console.log(`useMetaMaskWalletInfo 1`)
    const walletInfo = await metamaskProviderService.getWalletInfo();
    console.log(`useMetaMaskWalletInfo 1 walletInfo ${walletInfo}`);
    if (walletInfo) {
      useReduxDispatch(setAccount(walletInfo.account));
      useReduxDispatch(setBalance(walletInfo.balance));
      useReduxDispatch(setNetwork(walletInfo.networkName));
      useReduxDispatch(setChainId(walletInfo.chainId));
    }

    return walletInfo;
  }

  console.log(`useMetaMaskWalletInfo metamaskProviderService ${metamaskProviderService}`);

  return null;
}

export async function useMetaMaskSignature(message: string): Promise<string | null> {
  const walletInfo = await useMetaMaskWalletInfo();
  
  if (walletInfo) {
    const signer = walletInfo.signer;
    if (metamaskProviderService) {
      return await metamaskProviderService?.getSignature(signer, message); 
    }

    return null;
  }

  return null;
} 
