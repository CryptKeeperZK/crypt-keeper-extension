import deepEqual from "fast-deep-equal";
import { useSelector } from "react-redux";

import { RPCAction } from "@src/constants";
import { CreateIdentityOptions, IdentityMetadata } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { AppDispatch, AppRootState } from "@src/ui/store/configureAppStore";

export enum ActionType {
  SET_COMMITMENTS = "app/identities/setCommitments",
  SET_SELECTED = "app/identities/setSelected",
  SET_REQUEST_PENDING = "app/identities/setRequestPending",
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  meta?: unknown;
  error?: boolean;
};

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
  (strategy: string, messageSignature: string, options: CreateIdentityOptions) => async (): Promise<boolean> =>
    postMessage({
      method: RPCAction.CREATE_IDENTITY,
      payload: {
        strategy,
        messageSignature,
        options,
      },
    });

export const setActiveIdentity = (identityCommitment: string) => async (): Promise<boolean> => {
  if (!identityCommitment) {
    throw new Error("Identity Commitment not provided!");
  }

  return postMessage({
    method: RPCAction.SET_ACTIVE_IDENTITY,
    payload: identityCommitment,
  });
};

export const setIdentityName = (identityCommitment: string, name: string) => async (): Promise<boolean> => {
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

export const deleteIdentity = (identityCommitment: string) => async (): Promise<boolean> => {
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

export const deleteAllIdentities = () => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.DELETE_ALL_IDENTITIES,
  });

export const setSelected = (identityCommitment: string): Action<string> => ({
  type: ActionType.SET_SELECTED,
  payload: identityCommitment,
});

interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

export const setIdentities = (payload: IdentityData[]): Action<IdentityData[]> => ({
  type: ActionType.SET_COMMITMENTS,
  payload,
});

export const setIdentityRequestPending = (requestPending: boolean): Action<boolean> => ({
  type: ActionType.SET_REQUEST_PENDING,
  payload: requestPending,
});

export const fetchIdentities =
  () =>
  async (dispatch: AppDispatch): Promise<void> => {
    const data = await postMessage<IdentityData[]>({ method: RPCAction.GET_IDENTITIES });
    const selected = await postMessage<string>({ method: RPCAction.GET_ACTIVE_IDENTITY });
    dispatch(setIdentities(data));
    dispatch(setSelected(selected));
  };

// eslint-disable-next-line default-param-last
export default function identities(state = initialState, action: Action<unknown>): State {
  switch (action.type) {
    case ActionType.SET_COMMITMENTS:
      return reduceSetIdentities(state, action as Action<IdentityData[]>);
    case ActionType.SET_SELECTED:
      return {
        ...state,
        selected: action.payload as string,
      };
    case ActionType.SET_REQUEST_PENDING:
      return {
        ...state,
        requestPending: action.payload as boolean,
      };
    default:
      return state;
  }
}

interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

function reduceSetIdentities(state: State, action: Action<IdentityData[]>): State {
  const identityCommitments: string[] = [];
  const identityMap: Record<string, IdentityMetadata> = {};

  action.payload?.forEach((id) => {
    identityMap[id.commitment] = id.metadata;
    identityCommitments.push(id.commitment);
  });

  return {
    ...state,
    identityMap,
    identityCommitments,
  };
}

export const useIdentities = (): IdentityData[] =>
  useSelector((state: AppRootState) => {
    const { identityMap, identityCommitments } = state.identities;
    return identityCommitments.map((commitment) => ({
      commitment,
      metadata: identityMap[commitment],
    }));
  }, deepEqual);

export const useSelectedIdentity = (): IdentityData =>
  useSelector((state: AppRootState) => {
    const { identityMap, selected } = state.identities;
    return {
      commitment: selected,
      metadata: identityMap[selected],
    };
  }, deepEqual);

export const useIdentityRequestPending = (): boolean =>
  useSelector((state: AppRootState) => state.identities.requestPending, deepEqual);
