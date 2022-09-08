import pushMessage from "@src/util/pushMessage";
import createMetaMaskProvider from "@dimensiondev/metamask-extension-provider";
import { ethers } from "ethers";
import { setAccount, setBalance, setChainId, setNetwork, setWeb3Connecting } from "@src/ui/ducks/web3";
import { NetworkDetails, WalletInfo } from "@src/types";

declare type Ethers = typeof import("ethers");

export default class MetamaskServiceEthers {
  metamaskProvider?: any;
  ethersProvider?: any;

  constructor() {
    this.ensure()
      .then(() => {
        this.metamaskProvider.on("error", (e: any) => {
          console.log("4. Inside MetamaskServiceEthers ensure 5 error: ", e);
          throw e;
        });

        console.log("4. Inside MetamaskServiceEthers ensure 5 accountsChanged before");
        this.metamaskProvider.on("accountsChanged", async (account: string[]) => {
          console.log("4. Inside MetamaskServiceEthers ensure 5 accountsChanged: ", account);
          const balance = await this.getAccountBalance(account[0]);
          await pushMessage(setAccount(account[0]));
          await pushMessage(setBalance(balance));
        });

        this.metamaskProvider.on("chainChanged", async () => {
          console.log("4. Inside MetamaskServiceEthers ensure 6 chainChanged");

          const networkDetails: NetworkDetails = await this.getNetworkDetails();
          const networkName = networkDetails.name;
          const chainId = networkDetails.chainId;

          console.log("4. Inside MetamaskServiceEthers ensure 7");
          if (networkName) await pushMessage(setNetwork(networkName));
          if (chainId) await pushMessage(setChainId(chainId));
        });
      })
      .catch(e => {
        throw new Error(e);
      });
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
        this.ethersProvider = new ethers.providers.Web3Provider(this.metamaskProvider, "any");
      }
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
      const connectionDetails: WalletInfo = await this._requestConnection();

      return {
        account: connectionDetails.account,
        balance: connectionDetails.balance,
        networkName: connectionDetails.networkName,
        chainId: connectionDetails.chainId,
      };
    }

    return null;
  };

  getAccountBalance = async (account: string): Promise<number | string> => {
    const balance = await this.ethersProvider.getBalance(account);
    const balanceInEthString = ethers.utils.formatEther(balance);
    const balanceInEth = Number(balanceInEthString).toFixed(4);

    console.log("4. Inside MetamaskServiceEthers requestAccounts 7 balanceInEthString: ", balanceInEthString);
    console.log("4. Inside MetamaskServiceEthers requestAccounts 7 balanceInEth: ", balanceInEth);

    return balanceInEth;
  };

  getNetworkDetails = async (): Promise<NetworkDetails> => {
    const network = await this.ethersProvider.getNetwork();

    const chainId = network.chainId;
    const ensAddress = network.ensAddress;
    const name = network.name;

    return {
      chainId,
      ensAddress,
      name,
    };
  };

  connectMetamask = async (account: string | null = null): Promise<WalletInfo> => {
    let connectionDetails: WalletInfo;
    console.log("4. Inside MetamaskServiceEthers connectMetamask 1");
    await pushMessage(setWeb3Connecting(true));
    console.log("4. Inside MetamaskServiceEthers connectMetamask 2");

    try {
      console.log("4. Inside MetamaskServiceEthers connectMetamask 3");

      connectionDetails = await this._requestConnection();

      await pushMessage(setAccount(connectionDetails.account));
      await pushMessage(setBalance(connectionDetails.balance));
      await pushMessage(setNetwork(connectionDetails.networkName));
      await pushMessage(setChainId(connectionDetails.chainId));
      await pushMessage(setWeb3Connecting(false));
      console.log("4. Inside MetamaskServiceEthers connectMetamask 8");
      return connectionDetails;
    } catch (e) {
      console.log(`4. Inside MetamaskServiceEthers connectMetamask ERROR ${e}`);
      await pushMessage(setWeb3Connecting(false));
      throw e;
    }
  };

  private _requestConnection = async (): Promise<WalletInfo> => {
    await this.ensure();

    if (this.ethersProvider) {
      console.log("4. Inside MetamaskServiceEthers requestAccounts 4 eth_requestAccounts before");
      await this.ethersProvider.send("eth_requestAccounts", []);
      console.log("4. Inside MetamaskServiceEthers requestAccounts 5 eth_requestAccounts after");

      const signer = await this.ethersProvider.getSigner();
      const account = await signer.getAddress();
      const balance = await this.getAccountBalance(account);

      console.log("4. Inside MetamaskServiceEthers requestAccounts 6 signer[] address: ", account);
      console.log("4. Inside MetamaskServiceEthers requestAccounts 6 signer[]: ", signer);
      console.log("4. Inside MetamaskServiceEthers requestAccounts 6 signer[] balance: ", balance);

      const networkDetails: NetworkDetails = await this.getNetworkDetails();
      const networkName = networkDetails.name;
      const chainId = networkDetails.chainId;

      console.log("4. Inside MetamaskServiceEthers requestAccounts 7 networkName: ", networkName);
      console.log("4. Inside MetamaskServiceEthers requestAccounts 8 chainId: ", chainId);

      if (!signer) {
        throw new Error("No accounts found");
      }

      return {
        account,
        balance,
        networkName,
        chainId,
      };
    } else {
      throw new Error("this.ethersProvider is not defined yet!");
    }
  };

  // TOOD: implemment an updateMessage
  // updateMessages =async (params:type) => {
  // }
}
