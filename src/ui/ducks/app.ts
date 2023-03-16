import deepEqual from "fast-deep-equal";
import { useSelector } from "react-redux";
import { Dispatch } from "redux";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { AppRootState } from "@src/ui/store/configureAppStore";

export enum ActionType {
  SET_STATUS = "app/setStatus",
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  meta?: unknown;
  error?: boolean;
};

type State = {
  initialized: boolean;
  unlocked: boolean;
};

const initialState: State = {
  initialized: false,
  unlocked: false,
};

export const setStatus = (status: State): Action<State> => ({
  type: ActionType.SET_STATUS,
  payload: status,
});

export const closePopup = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.CLOSE_POPUP });
};

export const fetchStatus =
  () =>
  async (dispatch: Dispatch): Promise<void> => {
    const status = await postMessage<State>({ method: RPCAction.GET_STATUS });
    dispatch(setStatus(status));
  };

// eslint-disable-next-line default-param-last
export default function app(state = initialState, action: Action<State>): State {
  switch (action.type) {
    case ActionType.SET_STATUS:
      return {
        ...state,
        initialized: action.payload?.initialized ?? false,
        unlocked: action.payload?.unlocked ?? false,
      };
    default:
      return state;
  }
}

export const useAppStatus = (): State => useSelector((state: AppRootState) => state.app, deepEqual);
