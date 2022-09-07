import pushMessage from "@src/util/pushMessage";
import createMetaMaskProvider from "@dimensiondev/metamask-extension-provider";
import { ethers } from "ethers";
import { setAccount, setChainId, setNetwork, setWeb3Connecting } from "@src/ui/ducks/web3";
import { WalletInfo } from "@src/types";

declare type Ethers = typeof import("ethers");

export default class MetamaskServiceEthers {
  metamaskProvider?: any;
  ethersProvider?: any;

  constructor() {
    this.ensure();
  }

  ensure = async (payload: any = null) => {
    console.log("4. Inside MetamaskServiceEthers ensure 1");

    if (!this.metamaskProvider) {
      console.log("4. Inside MetamaskServiceEthers ensure 2");
      this.metamaskProvider = await createMetaMaskProvider();
    }

    if (this.metamaskProvider) {
      console.log("4. Inside MetamaskServiceEthers ensure 3");
      if (!this.ethersProvider) {
        console.log("4. Inside MetamaskServiceEthers ensure 4");
        this.ethersProvider = new ethers.providers.Web3Provider(this.metamaskProvider);
      }

      this.metamaskProvider.on("error", (e: any) => {
        console.log("4. Inside MetamaskServiceEthers ensure 5 error: ", e);
        throw e;
      });

      this.metamaskProvider.on("accountsChanged", async ([account]) => {
        console.log("4. Inside MetamaskServiceEthers ensure 5 accountsChanged: ", account);
        await pushMessage(setAccount(account));
      });

      this.metamaskProvider.on("chainChanged", async () => {
        console.log("4. Inside MetamaskServiceEthers ensure 6 chainChanged");
        const network = await this.ethersProvider?.getNetwork();

        const networkName = network.name;
        const chainId = network.chainId;

        console.log("4. Inside MetamaskServiceEthers ensure 7");
        if (networkName) await pushMessage(setNetwork(networkName));
        if (chainId) await pushMessage(setChainId(chainId));
      });
    }

    console.log("4. Inside MetamaskServiceEthers ensure8");

    return payload;
  };

  getWeb3 = async (): Promise<Ethers> => {
    if (!this.ethersProvider) throw new Error(`Ethers is not initialized`);
    return this.ethersProvider;
  };

  getWalletInfo = async (): Promise<WalletInfo | null> => {
    console.log("4. Inside MetamaskServiceEthers getWalletInfo 1");
    await this.ensure();

    console.log("4. Inside MetamaskServiceEthers getWalletInfo 2");
    if (!this.ethersProvider) {
      console.log("4. Inside MetamaskServiceEthers getWalletInfo 3");
      return null;
    }

    if (this.metamaskProvider?.selectedAddress) {
      const connectionDetails: WalletInfo = await this.requestConnection();

      return connectionDetails;
    }

    return null;
  };

  connectMetamask = async () => {
    console.log("4. Inside MetamaskServiceEthers connectMetamask 1");
    await pushMessage(setWeb3Connecting(true));
    console.log("4. Inside MetamaskServiceEthers connectMetamask 2");

    try {
      console.log("4. Inside MetamaskServiceEthers connectMetamask 3");
      await this.ensure();
      console.log("4. Inside MetamaskServiceEthers connectMetamask 4");
      if (this.ethersProvider) {
        const connectionDetails: WalletInfo = await this.requestConnection();

        await pushMessage(setAccount(connectionDetails.account));
        await pushMessage(setNetwork(connectionDetails.networkName));
        await pushMessage(setChainId(connectionDetails.chainId));
        console.log("4. Inside MetamaskServiceEthers connectMetamask 8");
      }

      await pushMessage(setWeb3Connecting(false));
    } catch (e) {
      console.log(`4. Inside MetamaskServiceEthers connectMetamask ERROR ${e}`);
      await pushMessage(setWeb3Connecting(false));
      throw e;
    }
  };

  requestConnection = async (): Promise<WalletInfo> => {
    console.log("4. Inside MetamaskServiceEthers requestAccounts 4 eth_requestAccounts before");
    await this.ethersProvider.send("eth_requestAccounts", []);

    console.log("4. Inside MetamaskServiceEthers requestAccounts 5");
    const signer = await this.ethersProvider.getSigner();
    const account = await signer.getAddress();
    const balance = await this.ethersProvider.getBalance(account);
    const balanceInEth = ethers.utils.formatEther(balance);

    console.log("4. Inside MetamaskServiceEthers requestAccounts 6 signer[] address: ", account);
    console.log("4. Inside MetamaskServiceEthers requestAccounts 6 signer[]: ", signer);
    console.log("4. Inside MetamaskServiceEthers requestAccounts 6 signer[] balance: ", balanceInEth);

    const network = await this.ethersProvider.getNetwork();

    const networkName = network.name;
    const chainId = network.chainId;

    console.log("4. Inside MetamaskServiceEthers requestAccounts 7 networkName: ", networkName);
    console.log("4. Inside MetamaskServiceEthers requestAccounts 8 chainId: ", chainId);

    if (!signer) {
      throw new Error("No accounts found");
    }

    return {
      account,
      balance: balanceInEth,
      networkName,
      chainId,
    };
  };
}
