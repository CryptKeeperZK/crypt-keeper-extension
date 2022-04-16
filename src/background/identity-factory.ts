import { IdentityMetadata } from '@src/types'
import { ZkIdentity } from '@zk-kit/identity'
import createIdentity from '@interep/identity'
import checkParameter from '@src/util/checkParameter'
import ZkIdentityDecorater from './identity-decorater'

const createInterrepIdentity = async (config: any): Promise<ZkIdentityDecorater> => {
    checkParameter(config, 'config', 'object')

    const { web2Provider, nonce = 0, name, web3, walletInfo } = config

    checkParameter(name, 'name', 'string')
    checkParameter(web2Provider, 'provider', 'string')
    checkParameter(web3, 'web3', 'object')
    checkParameter(walletInfo, 'walletInfo', 'object')

    const sign = (message: string) => web3.eth.personal.sign(message, walletInfo?.account)

    const identity: ZkIdentity = await createIdentity(sign, web2Provider, nonce)
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

    const identity: ZkIdentity = new ZkIdentity()
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
