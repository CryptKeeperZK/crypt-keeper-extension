import pushMessage from '@src/util/pushMessage'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import Web3 from 'web3'
import { setAccount, setChainId, setNetwork, setWeb3Connecting } from '@src/ui/ducks/web3'
import { WalletInfo } from '@src/types'

export default class MetamaskServiceWeb3 {
    provider?: any
    web3?: Web3

    constructor() {
        this.ensure()
    }

    ensure = async (payload: any = null) => {
        console.log("4. Inside MetamaskServiceWeb3 ensure 1");

        if (!this.provider) {
            console.log("4. Inside MetamaskServiceWeb3 ensure 2");
            this.provider = await createMetaMaskProvider()
        }

        if (this.provider) {
            console.log("4. Inside MetamaskServiceWeb3 ensure 3");
            if (!this.web3) {
                console.log("4. Inside MetamaskServiceWeb3 ensure 4");
                this.web3 = new Web3(this.provider)
            }

            this.provider.on('accountsChanged', async ([account]) => {
                console.log("4. Inside MetamaskServiceWeb3 ensure 5 accountsChanged", account);
                await pushMessage(setAccount(account))
            })

            this.provider.on('chainChanged', async () => {
                console.log("4. Inside MetamaskServiceWeb3 ensure 6");
                const networkType = await this.web3?.eth.net.getNetworkType()
                const chainId = await this.web3?.eth.getChainId()

                console.log("4. Inside MetamaskServiceWeb3 ensure 7");
                if (networkType) await pushMessage(setNetwork(networkType))
                if (chainId) await pushMessage(setChainId(chainId))
            })
        }

        console.log("4. Inside MetamaskServiceWeb3 ensure8");

        return payload
    }

    getWeb3 = async (): Promise<Web3> => {
        if (!this.web3) throw new Error(`web3 is not initialized`)
        return this.web3
    }

    getWalletInfo = async (): Promise<WalletInfo | null> => {
        await this.ensure()

        if (!this.web3) {
            return null
        }

        if (this.provider?.selectedAddress) {
            const accounts = await this.web3.eth.requestAccounts()
            const networkName = await this.web3.eth.net.getNetworkType()
            const balance = this.web3.utils.toDecimal(await this.web3.eth.getBalance(accounts[0]));
            const chainId = await this.web3.eth.getChainId()

            if (!accounts.length) {
                throw new Error('No accounts found')
            }

            return {
                signer: null,
                account: accounts[0],
                balance,
                networkName,
                chainId
            }
        }

        return null
    }

    connectMetamask = async () => {
        console.log("4. Inside MetamaskServiceWeb3 connectMetamask 1");
        await pushMessage(setWeb3Connecting(true))
        console.log("4. Inside MetamaskServiceWeb3 connectMetamask 2");

        try {
            console.log("4. Inside MetamaskServiceWeb3 connectMetamask 3");
            await this.ensure()
            console.log("4. Inside MetamaskServiceWeb3 connectMetamask 4");
            if (this.web3) {
                console.log("4. Inside MetamaskServiceWeb3 connectMetamask 5");
                const accounts = await this.web3.eth.requestAccounts()
                console.log("4. Inside MetamaskServiceWeb3 connectMetamask 6 ", accounts[0]);
                const networkType = await this.web3.eth.net.getNetworkType()
                console.log("4. Inside MetamaskServiceWeb3 connectMetamask 7 ", networkType);
                const chainId = await this.web3.eth.getChainId()
                console.log("4. Inside MetamaskServiceWeb3 connectMetamask 8 ", chainId);

                if (!accounts.length) {
                    throw new Error('No accounts found')
                }

                await pushMessage(setAccount(accounts[0]))
                await pushMessage(setNetwork(networkType))
                await pushMessage(setChainId(chainId))
                console.log(`4. Inside MetamaskServiceWeb3 connectMetamask Account ${accounts[0]}`);
                console.log("4. Inside MetamaskServiceWeb3 connectMetamask 8");
            }

            await pushMessage(setWeb3Connecting(false))
        } catch (e) {
            console.log(`4. Inside MetamaskServiceWeb3 connectMetamask ERROR ${e}`);
            await pushMessage(setWeb3Connecting(false))
            throw e
        }
    }
}
