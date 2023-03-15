import deepEqual from "fast-deep-equal";
import { useSelector } from "react-redux";
import { Dispatch } from "redux";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { PendingRequest } from "@src/types";
import type { AppRootState } from "@src/ui/store/configureAppStore";

enum ActionType {
  SET_PENDING_REQUESTS = "request/setPendingRequests",
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  meta?: unknown;
  error?: boolean;
};

type State = {
  pendingRequests: PendingRequest[];
};

const initialState: State = {
  pendingRequests: [],
};

export const setPendingRequest = (pendingRequests: PendingRequest[]): Action<PendingRequest[]> => ({
  type: ActionType.SET_PENDING_REQUESTS,
  payload: pendingRequests,
});

export const fetchRequestPendingStatus =
  () =>
  async (dispatch: Dispatch): Promise<void> => {
    const pendingRequests = await postMessage<PendingRequest[]>({ method: RPCAction.GET_PENDING_REQUESTS });
    dispatch(setPendingRequest(pendingRequests));
  };

// eslint-disable-next-line default-param-last
export default function requests(state = initialState, action: Action<PendingRequest[]>): State {
  switch (action.type) {
    case ActionType.SET_PENDING_REQUESTS:
      return {
        ...state,
        pendingRequests: action.payload ?? [],
      };
    default:
      return state;
  }
}

export const useRequestsPending = (): PendingRequest[] =>
  useSelector((state: AppRootState) => state.requests.pendingRequests, deepEqual);
