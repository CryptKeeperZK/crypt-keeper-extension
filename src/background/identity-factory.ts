import { IdentityMetadata } from '@src/types'
import { Identity } from "@semaphore-protocol/identity";
import createIdentity from '@interep/identity'
import checkParameter from '@src/util/checkParameter'
import ZkIdentityDecorater from './identity-decorater'

declare type Ethers = typeof import("ethers");

const createInterrepIdentity = async (config: any): Promise<ZkIdentityDecorater> => {
    checkParameter(config, 'config', 'object')

    const { web2Provider, nonce = 0, name, ethers, walletInfo } = config

    checkParameter(name, 'name', 'string')
    checkParameter(web2Provider, 'provider', 'string')
    console.log("createInterrepIdentity: 1")
    checkParameter(ethers, 'web3', 'object')
    console.log("createInterrepIdentity: 2")
    checkParameter(walletInfo, 'walletInfo', 'object')

    console.log("createInterrepIdentity: 3")

    const sign = async (message: string) => await walletInfo.signer.signMessage(message);

    console.log("createInterrepIdentity: 4")
    const identity: Identity = await createIdentity(sign, web2Provider, nonce)
    console.log("createInterrepIdentity: 5")
    const metadata: IdentityMetadata = {
        account: walletInfo.account,
        name,
        provider: 'interrep'
    }

    return new ZkIdentityDecorater(identity, metadata)
}

const createRandomIdentity = (config: any): ZkIdentityDecorater => {
    checkParameter(config, 'config', 'object')
    const { name } = config

    checkParameter(name, 'name', 'string')

    const identity: Identity = new Identity()
    const metadata: IdentityMetadata = {
        account: '',
        name: config.name,
        provider: 'random'
    }

    return new ZkIdentityDecorater(identity, metadata)
}

const strategiesMap = {
    random: createRandomIdentity,
    interrep: createInterrepIdentity
}

const identityFactory = async (strategy: keyof typeof strategiesMap, config: any): Promise<ZkIdentityDecorater> =>
    strategiesMap[strategy](config)

export default identityFactory
