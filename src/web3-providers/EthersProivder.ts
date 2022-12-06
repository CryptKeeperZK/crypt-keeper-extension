import { ethers, Signer } from "ethers";
import type Ethers from "ethers";
import { ExternalProvider, JsonRpcSigner, Network, Web3Provider } from "@ethersproject/providers";
import { NetworkDetails, WalletInfoBackgound } from "@src/types";
import { EthereumMethodType } from "./types";
import { chainId } from "wagmi";
import { MetaMaskInpageProvider } from "@dimensiondev/metamask-extension-provider";

export default class EthersProvider {
  private _ethersProvider: Web3Provider;

  constructor(web3Provider: any) {
    this._ethersProvider = new ethers.providers.Web3Provider(web3Provider, "any");
  }

  get getEthersProvider(): Web3Provider {
    return this._ethersProvider;
  }

  public async getWalletInfo(): Promise<WalletInfoBackgound> {
    await this.getAccounts();
    const signer = await this.getSigner();
    const signerAddress = await signer.getAddress();
    const network = await this.getNetworkDetails();
    const balance = await this.getAccountBalance(signerAddress);

    return {
      signer: signer,
      account: signerAddress,
      balance: balance,
      networkName: network.name,
      chainId: network.chainId,
    };
  }

  public async getSigner(): Promise<JsonRpcSigner> {
    return this._ethersProvider.getSigner();
  }

  public async getAccounts(): Promise<String[]> {
    return await this._ethersProvider.send(EthereumMethodType.ETH_REQUEST_ACCOUNTS, []);
  }

  public async getAccountBalance(account: string): Promise<string> {
    const balance = await this._ethersProvider.getBalance(account);
    const balanceInEthString = ethers.utils.formatEther(balance);
    const balanceInEth = Number(balanceInEthString).toFixed(4);

    return balanceInEth;
  }

  public async getNetworkDetails(): Promise<Network> {
    return await this._ethersProvider.getNetwork();
  }
}
