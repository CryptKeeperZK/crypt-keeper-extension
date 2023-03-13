import { Action, CreateIdentityOptions, IdentityMetadata } from "@src/types";
import postMessage from "@src/util/postMessage";
import { RPCAction } from "@src/constants";
import { useSelector } from "react-redux";
import { AppDispatch, AppRootState } from "@src/ui/store/configureAppStore";
import deepEqual from "fast-deep-equal";

export enum IdentityActionType {
  SET_COMMITMENTS = "app/identities/setCommitments",
  SET_SELECTED = "app/identities/setSelected",
  SET_REQUEST_PENDING = "app/identities/setRequestPending",
}

interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
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
  (strategy: string, messageSignature: string, options: CreateIdentityOptions) => async () =>
    postMessage({
      method: RPCAction.CREATE_IDENTITY,
      payload: {
        strategy,
        messageSignature,
        options,
      },
    });

export const setActiveIdentity = (identityCommitment: string) => async () => {
  if (!identityCommitment) {
    throw new Error("Identity Commitment not provided!");
  }

  return postMessage({
    method: RPCAction.SET_ACTIVE_IDENTITY,
    payload: identityCommitment,
  });
};

export const setIdentityName = (identityCommitment: string, name: string) => async () => {
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

export const deleteIdentity = (identityCommitment: string) => async () => {
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

export const deleteAllIdentities = () => async () => {
  return postMessage({
    method: RPCAction.DELETE_ALL_IDENTITIES,
  });
};

export const setSelected = (identityCommitment?: string) => ({
  type: IdentityActionType.SET_SELECTED,
  payload: identityCommitment,
});

export const setIdentities = (
  identities: IdentityData[],
): Action<IdentityActionType, IdentityData[]> => ({
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
    return identityCommitments.map((commitment) => ({
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
