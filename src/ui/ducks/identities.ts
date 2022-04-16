/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IdentityMetadata } from '@src/types'
import { Dispatch } from 'redux'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import { useSelector } from 'react-redux'
import { AppRootState } from '@src/ui/store/configureAppStore'
import deepEqual from 'fast-deep-equal'

export enum ActionType {
    SET_COMMITMENTS = 'app/identities/setCommitments',
    SET_SELECTED = 'app/identities/setSelected',
    SET_REQUEST_PENDING = 'app/identities/setRequestPending'
}

type Action<payload> = {
    type: ActionType
    payload?: payload
    meta?: any
    error?: boolean
}

type State = {
    identityCommitments: string[]
    identityMap: {
        [commitment: string]: IdentityMetadata
    }
    requestPending: boolean
    selected: string
}

const initialState: State = {
    identityCommitments: [],
    identityMap: {},
    requestPending: false,
    selected: ''
}

export const createIdentity = (strategy: string, options: any) => async (dispatch: Dispatch) =>
    postMessage({
        method: RPCAction.CREATE_IDENTITY,
        payload: {
            strategy,
            options
        }
    })

export const setActiveIdentity = (identityCommitment: string) => async (dispatch: Dispatch) => {
    if (!identityCommitment) {
        throw new Error('Identity Commitment not provided!')
    }
    return postMessage({
        method: RPCAction.SET_ACTIVE_IDENTITY,
        payload: identityCommitment
    })
}

export const setSelected = (identityCommitment: string) => ({
    type: ActionType.SET_SELECTED,
    payload: identityCommitment
})

export const setIdentities = (
    identities: { commitment: string; metadata: IdentityMetadata }[]
): Action<{ commitment: string; metadata: IdentityMetadata }[]> => ({
    type: ActionType.SET_COMMITMENTS,
    payload: identities
})

export const setIdentityRequestPending = (requestPending: boolean): Action<boolean> => ({
    type: ActionType.SET_REQUEST_PENDING,
    payload: requestPending
})

export const fetchIdentities = () => async (dispatch: Dispatch) => {
    const identities = await postMessage({ method: RPCAction.GET_IDENTITIES })
    const selected = await postMessage({ method: RPCAction.GET_ACTIVE_IDENTITY })
    dispatch(setIdentities(identities))
    dispatch(setSelected(selected))
}

// eslint-disable-next-line @typescript-eslint/default-param-last
export default function identities(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionType.SET_COMMITMENTS:
            return reduceSetIdentities(state, action)
        case ActionType.SET_SELECTED:
            return {
                ...state,
                selected: action.payload
            }
        case ActionType.SET_REQUEST_PENDING:
            return {
                ...state,
                requestPending: action.payload
            }
        default:
            return state
    }
}

function reduceSetIdentities(
    state: State,
    action: Action<{ commitment: string; metadata: IdentityMetadata }[]>
): State {
    const identityCommitments: string[] = []
    const identityMap = {}

    if (action.payload) {
        for (const id of action.payload) {
            identityMap[id.commitment] = id.metadata
            identityCommitments.push(id.commitment)
        }
    }

    return {
        ...state,
        identityMap,
        identityCommitments
    }
}

export const useIdentities = () =>
    useSelector((state: AppRootState) => {
        const { identityMap, identityCommitments } = state.identities
        return identityCommitments.map((commitment) => ({
                commitment,
                metadata: identityMap[commitment]
            }))
    }, deepEqual)

export const useSelectedIdentity = () =>
    useSelector((state: AppRootState) => {
        const { identityMap, selected } = state.identities
        return {
            commitment: selected,
            metadata: identityMap[selected]
        }
    }, deepEqual)

export const useIdentityRequestPending = () =>
    useSelector((state: AppRootState) => state.identities.requestPending, deepEqual)
