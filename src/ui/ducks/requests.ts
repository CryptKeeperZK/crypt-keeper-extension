import { useSelector } from "react-redux";
import { AppRootState } from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";
import { Action, PendingRequest } from "@src/types";
import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

enum ActionType {
  SET_PENDING_REQUESTS = "request/setPendingRequests",
}

type State = {
  pendingRequests: PendingRequest[];
};

const initialState: State = {
  pendingRequests: [],
};

export const setPendingRequest = (pendingRequests: PendingRequest[]): Action<ActionType, PendingRequest[]> => ({
  type: ActionType.SET_PENDING_REQUESTS,
  payload: pendingRequests,
});

export const fetchRequestPendingStatus = () => async () => {
  postMessage({ method: RPCAction.GET_PENDING_REQUESTS });
};

export default function requests(state = initialState, action: Action<ActionType, any>): State {
  switch (action.type) {
    case ActionType.SET_PENDING_REQUESTS:
      return {
        ...state,
        pendingRequests: action.payload,
      };
    default:
      return state;
  }
}

export const useRequestsPending = () => useSelector((state: AppRootState) => state.requests.pendingRequests, deepEqual);
