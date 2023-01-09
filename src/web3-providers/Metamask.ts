import pushMessage from "@src/util/pushMessage";
import createMetaMaskProvider, { MetaMaskInpageProvider } from "@dimensiondev/metamask-extension-provider";
import { setAccount, setBalance, setChainId, setNetwork, setWeb3Connecting } from "@src/ui/ducks/web3";
import { EthersProvider } from "./EthersProivder";
import { ExternalProvider, JsonRpcSigner, Network, Web3Provider } from "@ethersproject/providers";
import { WalletInfoBackgound } from "@src/types";

export class MetaMaskProviderService {
  private _metamaskProvider: MetaMaskInpageProvider;
  private _ethersProivder: EthersProvider;

  constructor() {
    this._metamaskProvider = createMetaMaskProvider();
    this._ethersProivder = new EthersProvider(this._metamaskProvider);

    // TODO: Remove `any` type
    // this._metamaskProvider.on("accountsChanged", async (account: any) => {
    //   console.log("Inside MetaMaskProvider accountsChanged: ", account);
    //   const balance = await this._ethersProivder.getAccountBalance(account[0]);
    //   await pushMessage(setAccount(account[0]));
    //   await pushMessage(setBalance(balance));
    // });

    // this._metamaskProvider.on("chainChanged", async () => {
    //   console.log("Inside MetaMaskProvider chainChanged");

    //   const networkDetails = await this._ethersProivder.getNetworkDetails();
    //   const networkName = networkDetails.name;
    //   const chainId = networkDetails.chainId;

    //   if (networkName) await pushMessage(setNetwork(networkName));
    //   if (chainId) await pushMessage(setChainId(chainId));
    // });

    // this._metamaskProvider.on("error", (e: any) => {
    //   console.log("Inside MetaMaskProvider  error: ", e);
    //   throw e;
    // });

    // this._metamaskProvider.on("connect", () => {
    //   console.log("Inside MetaMaskProvider  connect");
    // });

    // this._metamaskProvider.on("disconnect", () => {
    //   console.log("Inside MetaMaskProvider  disconnect");
    // });
  }

  get getMetamaskProvider(): MetaMaskInpageProvider {
    return this._metamaskProvider;
  }

  get getEthersProvider(): EthersProvider {
    return this._ethersProivder;
  }

  async connectMetaMask(): Promise<WalletInfoBackgound> {
    return await this._ethersProivder.connectWallet();
  }

  async getWalletInfo(): Promise<WalletInfoBackgound | null> {
    if (this._metamaskProvider?.selectedAddress) {
      console.log(`MetaMaskProviderService ${this._metamaskProvider?.selectedAddress}`);
      return await this._ethersProivder.getWalletInfo();
    }

    return null;
  }

  async getSignature(signer: JsonRpcSigner, message: string): Promise<string> {
    return await this._ethersProivder.getSignature(signer, message);
  }
}
