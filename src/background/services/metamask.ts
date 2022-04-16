import pushMessage from '@src/util/pushMessage'
import createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'
import Web3 from 'web3'
import { setAccount, setChainId, setNetwork, setWeb3Connecting } from '@src/ui/ducks/web3'
import { WalletInfo } from '@src/types'

export default class MetamaskService {
    provider?: any
    web3?: Web3

    constructor() {
        this.ensure()
    }

    ensure = async (payload: any = null) => {
        if (!this.provider) {
            this.provider = await createMetaMaskProvider()
        }

        if (this.provider) {
            if (!this.web3) {
                this.web3 = new Web3(this.provider)
            }

            this.provider.on('accountsChanged', ([account]) => {
                pushMessage(setAccount(account))
            })

            this.provider.on('chainChanged', async () => {
                const networkType = await this.web3?.eth.net.getNetworkType()
                const chainId = await this.web3?.eth.getChainId()

                if (networkType) pushMessage(setNetwork(networkType))
                if (chainId) pushMessage(setChainId(chainId))
            })
        }

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
            const networkType = await this.web3.eth.net.getNetworkType()
            const chainId = await this.web3.eth.getChainId()

            if (!accounts.length) {
                throw new Error('No accounts found')
            }

            return {
                account: accounts[0],
                networkType,
                chainId
            }
        }

        return null
    }

    connectMetamask = async () => {
        await pushMessage(setWeb3Connecting(true))

        try {
            await this.ensure()

            if (this.web3) {
                const accounts = await this.web3.eth.requestAccounts()
                const networkType = await this.web3.eth.net.getNetworkType()
                const chainId = await this.web3.eth.getChainId()

                if (!accounts.length) {
                    throw new Error('No accounts found')
                }

                await pushMessage(setAccount(accounts[0]))
                await pushMessage(setNetwork(networkType))
                await pushMessage(setChainId(chainId))
            }

            await pushMessage(setWeb3Connecting(false))
        } catch (e) {
            await pushMessage(setWeb3Connecting(false))
            throw e
        }
    }
}
