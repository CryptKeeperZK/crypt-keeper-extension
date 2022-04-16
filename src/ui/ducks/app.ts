import { Dispatch } from 'redux'
import postMessage from '@src/util/postMessage'
import RPCAction from '@src/util/constants'
import { useSelector } from 'react-redux'
import { AppRootState } from '@src/ui/store/configureAppStore'
import deepEqual from 'fast-deep-equal'

export enum ActionType {
    SET_STATUS = 'app/setStatus'
}

type Action<payload> = {
    type: ActionType
    payload?: payload
    meta?: any
    error?: boolean
}

type State = {
    initialized: boolean
    unlocked: boolean
}

const initialState: State = {
    initialized: false,
    unlocked: false
}

export const setStatus = (status: {
    initialized: boolean
    unlocked: boolean
}): Action<{
    initialized: boolean
    unlocked: boolean
}> => ({
    type: ActionType.SET_STATUS,
    payload: status
})

export const fetchStatus = () => async (dispatch: Dispatch) => {
    const status = await postMessage({ method: RPCAction.GET_STATUS })
    dispatch(setStatus(status))
}

export default function app(state = initialState, action: Action<any>): State {
    switch (action.type) {
        case ActionType.SET_STATUS:
            return {
                ...state,
                initialized: action.payload.initialized,
                unlocked: action.payload.unlocked
            }
        default:
            return state
    }
}

export const useAppStatus = () => useSelector((state: AppRootState) => state.app, deepEqual)
