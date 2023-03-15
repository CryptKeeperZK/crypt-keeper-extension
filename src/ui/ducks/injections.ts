import { Action } from "@src/types";
import { useSelector } from "react-redux";
import { AppRootState } from "../store/configureAppStore";
import deepEqual from "fast-deep-equal";

export enum InjectionActionType {
    TRY_INJECT = "app/inject"
}

type State = {
    isApproved: Boolean,
    canSkipApprove: Boolean
}

const initialState: State = {
    isApproved: false,
    canSkipApprove: false
}

export const setInjection = (injection: {
    isApproved: Boolean;
    canSkipApprove: Boolean;
}): Action<InjectionActionType, {
    isApproved: Boolean;
    canSkipApprove: Boolean;
}> => ({
    type: InjectionActionType.TRY_INJECT,
    payload: injection
})

export default function injections(
    state = initialState,
    action: Action<InjectionActionType, {
        isApproved: Boolean;
        canSkipApprove: Boolean;
    }>
): State {
    switch (action.type) {
        case InjectionActionType.TRY_INJECT:
            return {
                ...state,
                isApproved: action.payload ? action.payload.isApproved : false,
                canSkipApprove: action.payload ? action.payload.canSkipApprove : false
            }
        default: 
            return state;
    }
}

export const useInjections = () => useSelector((state: AppRootState) => state.injections, deepEqual);
