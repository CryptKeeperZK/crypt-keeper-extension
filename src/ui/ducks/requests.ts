import { useSelector } from "react-redux";
import { AppRootState } from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";
import { PendingRequest } from "@src/types";
import { Dispatch } from "redux";
import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

enum ActionType {
  SET_PENDING_REQUESTS = "request/setPendingRequests",
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  meta?: any;
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

export const fetchRequestPendingStatus = () => async (dispatch: Dispatch) => {
  const pendingRequests = await postMessage({ method: RPCAction.GET_PENDING_REQUESTS });
  dispatch(setPendingRequest(pendingRequests));
};

export default function requests(state = initialState, action: Action<any>): State {
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
