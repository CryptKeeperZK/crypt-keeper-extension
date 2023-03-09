/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Action, CreateIdentityOptions, IdentityMetadata } from "@src/types";
import postMessage from "@src/util/postMessage";
import RPCAction from "@src/util/constants";
import { useSelector } from "react-redux";
import { AppDispatch, AppRootState } from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";
import log from "loglevel";

export enum IdentityActionType {
  SET_COMMITMENTS = "app/identities/setCommitments",
  SET_SELECTED = "app/identities/setSelected",
  SET_REQUEST_PENDING = "app/identities/setRequestPending",
}

type State = {
  identityCommitments: string[];
  identityMap: {
    [commitment: string]: IdentityMetadata;
  };
  requestPending: boolean;
  selected: string;
};

const initialState: State = {
  identityCommitments: [],
  identityMap: {},
  requestPending: false,
  selected: "",
};

export const createIdentity =
  (strategy: string, messageSignature: string, options: CreateIdentityOptions) => async (dispatch: AppDispatch) =>
    postMessage({
      method: RPCAction.CREATE_IDENTITY,
      payload: {
        strategy,
        messageSignature,
        options,
      },
    });

export const setActiveIdentity = (identityCommitment: string) => async (dispatch: AppDispatch) => {
  if (!identityCommitment) {
    throw new Error("Identity Commitment not provided!");
  }
  return postMessage({
    method: RPCAction.SET_ACTIVE_IDENTITY,
    payload: identityCommitment,
  });
};

export const setIdentityName = (identityCommitment: string, name: string) => async (dispatch: AppDispatch) => {
  log.debug("Inside setIdentityName");
  if (!identityCommitment) {
    throw new Error("Identity Commitment not provided!");
  }
  return postMessage({
    method: RPCAction.SET_IDENTITY_NAME,
    payload: {
      identityCommitment,
      name,
    },
  });
};

export const deleteIdentity = (identityCommitment: string) => async (dispatch: AppDispatch) => {
  log.debug("Inside deleteIdentity");
  if (!identityCommitment) {
    throw new Error("Identity Commitment not provided!");
  }
  return postMessage({
    method: RPCAction.DELETE_IDENTITY,
    payload: {
      identityCommitment,
    },
  });
};

export const deleteAllIdentities = () => async (dispatch: AppDispatch) => {
  return postMessage({
    method: RPCAction.DELETE_ALL_IDENTITIES,
  });
};

export const setSelected = (identityCommitment?: string) => ({
  type: IdentityActionType.SET_SELECTED,
  payload: identityCommitment,
});

export const setIdentities = (
  identities: { commitment: string; metadata: IdentityMetadata }[],
): Action<IdentityActionType, { commitment: string; metadata: IdentityMetadata }[]> => ({
  type: IdentityActionType.SET_COMMITMENTS,
  payload: identities,
});

export const setIdentityRequestPending = (requestPending: boolean): Action<IdentityActionType, boolean> => ({
  type: IdentityActionType.SET_REQUEST_PENDING,
  payload: requestPending,
});

export const fetchIdentities = () => async (dispatch: AppDispatch) => {
  postMessage({ method: RPCAction.GET_IDENTITIES });
  postMessage({ method: RPCAction.GET_ACTIVE_IDENTITY });
};

// eslint-disable-next-line @typescript-eslint/default-param-last
export default function identities(state = initialState, action: Action<IdentityActionType, any>): State {
  switch (action.type) {
    case IdentityActionType.SET_COMMITMENTS:
      return reduceSetIdentities(state, action);
    case IdentityActionType.SET_SELECTED:
      return {
        ...state,
        selected: action.payload,
      };
    case IdentityActionType.SET_REQUEST_PENDING:
      return {
        ...state,
        requestPending: action.payload,
      };
    default:
      return state;
  }
}

function reduceSetIdentities(
  state: State,
  action: Action<IdentityActionType, { commitment: string; metadata: IdentityMetadata }[]>,
): State {
  const identityCommitments: string[] = [];
  const identityMap: Record<string, IdentityMetadata> = {};

  if (action.payload) {
    for (const id of action.payload) {
      identityMap[id.commitment] = id.metadata;
      identityCommitments.push(id.commitment);
    }
  }

  return {
    ...state,
    identityMap,
    identityCommitments,
  };
}

export const useIdentities = () =>
  useSelector((state: AppRootState) => {
    const { identityMap, identityCommitments } = state.identities;
    return identityCommitments.map(commitment => ({
      commitment,
      metadata: identityMap[commitment],
    }));
  }, deepEqual);

export const useSelectedIdentity = () =>
  useSelector((state: AppRootState) => {
    const { identityMap, selected } = state.identities;
    return {
      commitment: selected,
      metadata: identityMap[selected],
    };
  }, deepEqual);

export const useIdentityRequestPending = () =>
  useSelector((state: AppRootState) => state.identities.requestPending, deepEqual);
