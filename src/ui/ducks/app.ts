import postMessage from "@src/util/postMessage";
import RPCAction from "@src/util/constants";
import { useSelector } from "react-redux";
import { AppRootState } from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";
import { Action } from "@src/types";

export enum AppActionType {
  SET_STATUS = "app/setStatus",
}

type State = {
  initialized: boolean;
  unlocked: boolean;
};

const initialState: State = {
  initialized: false,
  unlocked: false,
};

export const setStatus = (status: {
  initialized: boolean;
  unlocked: boolean;
}): Action<
  AppActionType,
  {
    initialized: boolean;
    unlocked: boolean;
  }
> => ({
  type: AppActionType.SET_STATUS,
  payload: status,
});

export const fetchStatus = () => async () => {
  postMessage({ method: RPCAction.GET_STATUS });
};

export default function app(state = initialState, action: Action<AppActionType, any>): State {
  switch (action.type) {
    case AppActionType.SET_STATUS:
      return {
        ...state,
        initialized: action.payload.initialized,
        unlocked: action.payload.unlocked,
      };
    default:
      return state;
  }
}

export const useAppStatus = () => useSelector((state: AppRootState) => state.app, deepEqual);
