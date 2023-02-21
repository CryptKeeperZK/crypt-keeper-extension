import pushMessage from "@src/util/pushMessage";
import { MetaMaskInpageProvider } from "@dimensiondev/metamask-extension-provider";
import { ethers } from "ethers";
import { setAccount, setBalance, setChainId, setNetwork, setWeb3Connecting } from "@src/ui/ducks/web3";
import { NetworkDetails, WalletInfo, WalletInfoBackground } from "@src/types";
import log from "loglevel";

declare type Ethers = typeof import("ethers");

export default class MetamaskServiceEthers {
  metamaskProvider?: any;
  ethersProvider?: any;

  constructor(metamaskProviderPayload?: MetaMaskInpageProvider) {
    if (metamaskProviderPayload) {
      this.ensure(metamaskProviderPayload);
      // .then(() => {
      //   log.debug("4. Inside MetamaskServiceEthers ensure 5 accountsChanged before");
      //   this.metamaskProvider.on("accountsChanged", async (account: string[]) => {
      //     log.debug("4. Inside MetamaskServiceEthers ensure 5 accountsChanged: ", account);
      //     const balance = await this.getAccountBalance(account[0]);
      //     await pushMessage(setAccount(account[0]));
      //     await pushMessage(setBalance(balance));
      //   });

      //   this.metamaskProvider.on("chainChanged", async () => {
      //     log.debug("4. Inside MetamaskServiceEthers ensure 6 chainChanged");

      //     const networkDetails: NetworkDetails = await this.getNetworkDetails();
      //     const networkName = networkDetails.name;
      //     const chainId = networkDetails.chainId;

      //     log.debug("4. Inside MetamaskServiceEthers ensure 7");
      //     if (networkName) await pushMessage(setNetwork(networkName));
      //     if (chainId) await pushMessage(setChainId(chainId));
      //   });

      //   this.metamaskProvider.on("error", (e: any) => {
      //     log.debug("4. Inside MetamaskServiceEthers ensure 5 error: ", e);
      //     throw e;
      //   });

      //   this.metamaskProvider.on("connect", () => {
      //     log.debug("4. Inside MetamaskServiceEthers ensure connect");
      //   });

      //   this.metamaskProvider.on("disconnect", () => {import LocalMessageDuplexStream from 'post-message-stream';
      //     log.debug("4. Inside MetamaskServiceEthers ensure disconnect");
      //   });
      // })
      // .catch(e => {
      //   throw new Error(e);
      // });
    }
  }

  ensure = async (metamaskProviderPayload?: MetaMaskInpageProvider) => {
    log.debug("4. Inside MetamaskServiceEthers ensure 1 metamaskProviderPayload", metamaskProviderPayload);

    if (!this.metamaskProvider) {
      log.debug("4. Inside MetamaskServiceEthers ensure 2");
      try {
        this.metamaskProvider = metamaskProviderPayload;
      } catch (e: any) {
        log.debug("Stopped here!!!!!", e);
        throw new Error(e);
      }
    }

    if (this.metamaskProvider) {
      log.debug("4. Inside MetamaskServiceEthers ensure 3");
      if (!this.ethersProvider) {
        log.debug("4. Inside MetamaskServiceEthers ensure 4");
        this.ethersProvider = new ethers.providers.Web3Provider(this.metamaskProvider, "any");
      }
    }

    log.debug("4. Inside MetamaskServiceEthers ensure8");

    return metamaskProviderPayload;
  };

  getWeb3 = async (): Promise<Ethers> => {
    if (!this.ethersProvider) throw new Error("Ethers is not initialized");
    return this.ethersProvider;
  };

  getWalletInfo = async (isBackgound = false): Promise<WalletInfoBackground | WalletInfo | null> => {
    log.debug("4. Inside MetamaskServiceEthers getWalletInfo 2");
    if (!this.ethersProvider) {
      log.debug("4. Inside MetamaskServiceEthers getWalletInfo 3");
      return null;
    }

    if (this.metamaskProvider?.selectedAddress) {
      const connectionDetailsBackground: WalletInfoBackground = await this._requestConnection();

      if (isBackgound) {
        log.debug("4. Inside MetamaskServiceEthers getWalletInfo 4 bacground", connectionDetailsBackground);
        return connectionDetailsBackground;
      } else {
        log.debug("4. Inside MetamaskServiceEthers getWalletInfo 4 frontend", connectionDetailsBackground);
        return {
          account: connectionDetailsBackground.account,
          balance: connectionDetailsBackground.balance,
          networkName: connectionDetailsBackground.networkName,
          chainId: connectionDetailsBackground.chainId,
        };
      }
    }

    return null;
  };

  getAccountBalance = async (account: string): Promise<number | string> => {
    const balance = await this.ethersProvider.getBalance(account);
    const balanceInEthString = ethers.utils.formatEther(balance);
    const balanceInEth = Number(balanceInEthString).toFixed(4);

    log.debug("4. Inside MetamaskServiceEthers requestAccounts 7 balanceInEthString: ", balanceInEthString);
    log.debug("4. Inside MetamaskServiceEthers requestAccounts 7 balanceInEth: ", balanceInEth);

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

  connectMetamask = async (): Promise<WalletInfo> => {
    let connectionDetails: WalletInfo;
    log.debug("4. Inside MetamaskServiceEthers connectMetamask 1");
    await pushMessage(setWeb3Connecting(true));
    log.debug("4. Inside MetamaskServiceEthers connectMetamask 2");

    try {
      log.debug("4. Inside MetamaskServiceEthers connectMetamask 3");

      connectionDetails = await this._requestConnection();

      await pushMessage(setAccount(connectionDetails.account));
      await pushMessage(setBalance(connectionDetails.balance));
      await pushMessage(setNetwork(connectionDetails.networkName));
      await pushMessage(setChainId(connectionDetails.chainId));
      await pushMessage(setWeb3Connecting(false));
      log.debug("4. Inside MetamaskServiceEthers connectMetamask 8");
      return connectionDetails;
    } catch (e) {
      log.debug(`4. Inside MetamaskServiceEthers connectMetamask ERROR ${e}`);
      await pushMessage(setWeb3Connecting(false));
      throw e;
    }
  };

  private _requestConnection = async (): Promise<WalletInfoBackground> => {
    await this.ensure();

    if (this.ethersProvider) {
      log.debug("4. Inside MetamaskServiceEthers requestAccounts 4 eth_requestAccounts before");

      try {
        const res = await this.ethersProvider.send("eth_requestAccounts", []);
        log.debug("4. Inside MetamaskServiceEthers requestAccounts 4 eth_requestAccounts response: ", res);
      } catch (error) {
        throw new Error("Errro in requesting accounts");
      }

      log.debug("4. Inside MetamaskServiceEthers requestAccounts 5 eth_requestAccounts after");

      const signer = await this.ethersProvider.getSigner();
      const account = await signer.getAddress();
      const balance = await this.getAccountBalance(account);

      log.debug("4. Inside MetamaskServiceEthers requestAccounts 6 signer[] address: ", account);
      log.debug("4. Inside MetamaskServiceEthers requestAccounts 6 signer[]: ", signer);
      log.debug("4. Inside MetamaskServiceEthers requestAccounts 6 signer[] balance: ", balance);

      const networkDetails: NetworkDetails = await this.getNetworkDetails();
      const networkName = networkDetails.name;
      const chainId = networkDetails.chainId;

      log.debug("4. Inside MetamaskServiceEthers requestAccounts 7 networkName: ", networkName);
      log.debug("4. Inside MetamaskServiceEthers requestAccounts 8 chainId: ", chainId);

      if (!signer) {
        throw new Error("No accounts found");
      }

      return {
        signer,
        account,
        balance,
        networkName,
        chainId,
      };
    } else {
      throw new Error("this.ethersProvider is not defined yet!");
    }
  };

  // TOOD: implement an updateMessage
  // updateMessages =async (params:type) => {
  // }
}
