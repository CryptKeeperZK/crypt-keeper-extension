import { useSelector } from 'react-redux'
import deepEqual from 'fast-deep-equal'
import { AppRootState } from '@src/ui/store/configureAppStore'
import { Dispatch } from 'redux'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import ChainsJSON from '@src/static/chains.json'

type ChainInfo = {
    chainId: number
    infoURL: string
    name: string
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
    shortName: string
}

export const chainsMap = ChainsJSON.reduce(
    (
        map: {
            [id: number]: ChainInfo
        },
        chainInfo: ChainInfo
    ) => {
        map[chainInfo.chainId] = chainInfo
        return map
    },
    {}
)

enum ActionTypes {
    SET_LOADING = 'web3/setLoading',
    SET_CONNECTING = 'web3/setConnecting',
    SET_ACCOUNT = 'web3/setAccount',
    SET_NETWORK = 'web3/setNetwork',
    SET_CHAIN_ID = 'web3/setChainId'
}

type Action<payload> = {
    type: ActionTypes
    payload?: payload
    meta?: any
    error?: boolean
}

type State = {
    account: string
    networkType: string
    chainId: number
    loading: boolean
    connecting: boolean
}

const initialState: State = {
    account: '',
    networkType: '',
    chainId: -1,
    loading: false,
    connecting: false
}

export const setWeb3Connecting = (connecting: boolean): Action<boolean> => ({
    type: ActionTypes.SET_CONNECTING,
    payload: connecting
})

export const setAccount = (account: string): Action<string> => ({
    type: ActionTypes.SET_ACCOUNT,
    payload: account
})

export const setNetwork = (network: string): Action<string> => ({
    type: ActionTypes.SET_NETWORK,
    payload: network
})

export const setChainId = (chainId: number): Action<number> => ({
    type: ActionTypes.SET_CHAIN_ID,
    payload: chainId
})

export const fetchWalletInfo = () => async (dispatch: Dispatch) => {
    const info = await postMessage({ method: RPCAction.GET_WALLET_INFO })

    if (info) {
        dispatch(setAccount(info.account))
        dispatch(setNetwork(info.networkType))
        dispatch(setChainId(info.chainId))
    }
}

// eslint-disable-next-line @typescript-eslint/default-param-last
export default function web3(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionTypes.SET_ACCOUNT:
            return {
                ...state,
                account: action.payload
            }
        case ActionTypes.SET_NETWORK:
            return {
                ...state,
                networkType: action.payload
            }
        case ActionTypes.SET_CHAIN_ID:
            return {
                ...state,
                chainId: action.payload
            }
        case ActionTypes.SET_CONNECTING:
            return {
                ...state,
                connecting: action.payload
            }
        default:
            return state
    }
}

export const useWeb3Connecting = () => useSelector((state: AppRootState) => state.web3.connecting, deepEqual)

export const useAccount = () => useSelector((state: AppRootState) => state.web3.account, deepEqual)

export const useNetwork = (): ChainInfo | null => useSelector((state: AppRootState) => {
        const chainInfo = chainsMap[state.web3.chainId]
        return chainInfo || null
    }, deepEqual)

export const useChainId = () => useSelector((state: AppRootState) => state.web3.chainId, deepEqual)
