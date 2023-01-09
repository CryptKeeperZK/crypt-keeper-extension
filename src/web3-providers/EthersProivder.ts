import { ethers } from "ethers";
import { JsonRpcSigner, Network, Web3Provider } from "@ethersproject/providers";
import { WalletInfoBackgound } from "@src/types";
import { EthereumMethodType } from "./types";

export class EthersProvider {
  private _ethersProvider: Web3Provider;

  constructor(web3Provider: any) {
    this._ethersProvider = new ethers.providers.Web3Provider(web3Provider, "any");
  }

  get getEthersProvider(): Web3Provider {
    return this._ethersProvider;
  }

  async getWalletInfo(): Promise<WalletInfoBackgound> {
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

  async connectWallet(): Promise<WalletInfoBackgound> {
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

  async getSigner(): Promise<JsonRpcSigner> {
    return this._ethersProvider.getSigner();
  }

  async getAccounts(): Promise<String[]> {
    return await this._ethersProvider.send(EthereumMethodType.ETH_REQUEST_ACCOUNTS, []);
  }

  async getAccountBalance(account: string): Promise<string> {
    const balance = await this._ethersProvider.getBalance(account);
    const balanceInEthString = ethers.utils.formatEther(balance);
    const balanceInEth = Number(balanceInEthString).toFixed(4);

    return balanceInEth;
  }

  async getNetworkDetails(): Promise<Network> {
    return await this._ethersProvider.getNetwork();
  }

  async getSignature(signer: JsonRpcSigner, message: string): Promise<string>{
    return await signer.signMessage(message);
  }
}
