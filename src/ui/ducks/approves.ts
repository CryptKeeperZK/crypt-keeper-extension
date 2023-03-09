import { Action } from "@src/types";
import postMessage from "@src/util/postMessage";
import RPCAction from "@src/util/constants";
import { useSelector } from "react-redux";
import deepEqual from "fast-deep-equal";
import { AppRootState } from "../store/configureAppStore";

export enum ApproveActionType {
  GET_HOST_PERMISSIONS = "app/hosts/getHostPermissions",
  SET_HOST_PERMISSIONS = "app/hosts/setHostPermissions",
  IS_HOST_APPROVED = "app/hosts/isHostApprove",
}

type State = {
  host: string;
  noApproval: boolean;
};

const initialState: State = {
  host: "",
  noApproval: false,
};

export const setApproval = (approval: {
  host: string;
  noApproval: boolean;
}): Action<
  ApproveActionType,
  {
    host: string;
    noApproval: boolean;
  }
> => ({
  type: ApproveActionType.SET_HOST_PERMISSIONS,
  payload: approval,
});

export const setHostPermission = (approval: { host: string; noApproval: boolean }) => async () => {
  if (!approval) {
    throw new Error("Approval not provided!");
  }

  postMessage({
    method: RPCAction.SET_HOST_PERMISSIONS,
    payload: approval,
  });
};

export const fetchApproval = (host: string) => async () => {
  postMessage({
    method: RPCAction.GET_HOST_PERMISSIONS,
    payload: host,
  });
};

export const fetchIsApproved = (host: string) => async () => {
  postMessage({
    method: RPCAction.IS_HOST_APPROVED,
    payload: host,
  });
};

export default function approves(
  state = initialState,
  action: Action<
    ApproveActionType,
    {
      host: string;
      noApproval: boolean;
    }
  >,
): State {
  switch (action.type) {
    case ApproveActionType.SET_HOST_PERMISSIONS:
      return {
        ...state,
        host: action.payload ? action.payload.host : "",
        noApproval: action.payload ? action.payload.noApproval : false,
      };
    default:
      return state;
  }
}

export const useApproves = () => useSelector((state: AppRootState) => state.approves, deepEqual);
