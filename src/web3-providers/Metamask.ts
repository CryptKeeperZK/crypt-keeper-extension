import createMetaMaskProvider, { MetaMaskInpageProvider } from "@dimensiondev/metamask-extension-provider";
import { EthersProvider } from "./EthersProivder";
import { JsonRpcSigner } from "@ethersproject/providers";
import { WalletInfoBackground } from "@src/types";
import log from "loglevel";

export class MetaMaskProviderService {
  private _metamaskProvider: MetaMaskInpageProvider;
  private _ethersProivder: EthersProvider;

  constructor() {
    this._metamaskProvider = createMetaMaskProvider();
    this._ethersProivder = new EthersProvider(this._metamaskProvider);

    // TODO: Remove `any` type
    // this._metamaskProvider.on("accountsChanged", async (account: any) => {
    //   log.debug("Inside MetaMaskProvider accountsChanged: ", account);
    //   const balance = await this._ethersProivder.getAccountBalance(account[0]);
    //   await pushMessage(setAccount(account[0]));
    //   await pushMessage(setBalance(balance));
    // });

    // this._metamaskProvider.on("chainChanged", async () => {
    //   log.debug("Inside MetaMaskProvider chainChanged");

    //   const networkDetails = await this._ethersProivder.getNetworkDetails();
    //   const networkName = networkDetails.name;
    //   const chainId = networkDetails.chainId;

    //   if (networkName) await pushMessage(setNetwork(networkName));
    //   if (chainId) await pushMessage(setChainId(chainId));
    // });

    // this._metamaskProvider.on("error", (e: any) => {
    //   log.debug("Inside MetaMaskProvider  error: ", e);
    //   throw e;
    // });

    // this._metamaskProvider.on("connect", () => {
    //   log.debug("Inside MetaMaskProvider  connect");
    // });

    // this._metamaskProvider.on("disconnect", () => {
    //   log.debug("Inside MetaMaskProvider  disconnect");
    // });
  }

  get getMetamaskProvider(): MetaMaskInpageProvider {
    return this._metamaskProvider;
  }

  get getEthersProvider(): EthersProvider {
    return this._ethersProivder;
  }

  async connectMetaMask(): Promise<WalletInfoBackground> {
    return this._ethersProivder.connectWallet();
  }

  async getWalletInfo(): Promise<WalletInfoBackground | null> {
    if (this._metamaskProvider?.selectedAddress) {
      log.debug(`MetaMaskProviderService ${this._metamaskProvider?.selectedAddress}`);
      return await this._ethersProivder.getWalletInfo();
    }

    return null;
  }

  async getSignature(signer: JsonRpcSigner, message: string): Promise<string> {
    return await this._ethersProivder.getSignature(signer, message);
  }
}
