/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCAction } from "@src/constants";
import { CreateIdentityOptions, HistorySettings, IdentityMetadata, IdentityStrategy, Operation } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IdentitiesState {
  identities: IdentityData[];
  operations: Operation[];
  requestPending: boolean;
  selected: SelectedIdentity; // This aim to be a short-term solution to the integration with Zkitter
  settings?: HistorySettings;
}

export interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

export interface SelectedIdentity {
  commitment: string;
  web2Provider?: string;
}

const initialState: IdentitiesState = {
  identities: [],
  operations: [],
  settings: undefined,
  requestPending: false,
  selected: {
    commitment: "",
    web2Provider: "",
  },
};

const identitiesSlice = createSlice({
  name: "identities",
  initialState,
  reducers: {
    setSelectedCommitment: (state: IdentitiesState, action: PayloadAction<SelectedIdentity>) => {
      state.selected = {
        commitment: action.payload.commitment,
        web2Provider: action.payload.web2Provider,
      };
    },

    setIdentityRequestPending: (state: IdentitiesState, action: PayloadAction<boolean>) => {
      state.requestPending = action.payload;
    },

    setIdentities: (state: IdentitiesState, action: PayloadAction<IdentityData[]>) => {
      state.identities = action.payload;
    },

    setOperations: (state: IdentitiesState, action: PayloadAction<Operation[]>) => {
      state.operations = action.payload;
    },

    setSettings: (state: IdentitiesState, action: PayloadAction<HistorySettings>) => {
      state.settings = action.payload;
    },
  },
});

export const { setSelectedCommitment, setIdentities, setIdentityRequestPending, setOperations, setSettings } =
  identitiesSlice.actions;

export const createIdentityRequest = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.CREATE_IDENTITY_REQ });
};

export const createIdentity =
  (strategy: IdentityStrategy, messageSignature: string, options: CreateIdentityOptions) =>
  async (): Promise<boolean> =>
    postMessage({
      method: RPCAction.CREATE_IDENTITY,
      payload: {
        strategy,
        messageSignature,
        options,
      },
    });

export const setActiveIdentity = (identityCommitment: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.SET_ACTIVE_IDENTITY,
    payload: {
      identityCommitment,
    },
  });

export const setIdentityName = (identityCommitment: string, name: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.SET_IDENTITY_NAME,
    payload: {
      identityCommitment,
      name,
    },
  });

export const deleteIdentity = (identityCommitment: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.DELETE_IDENTITY,
    payload: {
      identityCommitment,
    },
  });

export const deleteAllIdentities = () => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.DELETE_ALL_IDENTITIES,
  });

export const fetchIdentities = (): TypedThunk => async (dispatch) => {
  const data = await postMessage<IdentityData[]>({ method: RPCAction.GET_IDENTITIES });
  const { commitment, web2Provider } = await postMessage<SelectedIdentity>({
    method: RPCAction.GET_ACTIVE_IDENTITY_DATA,
  });
  dispatch(setIdentities(data));
  dispatch(
    setSelectedCommitment({
      commitment,
      web2Provider,
    }),
  );
};

export const fetchHistory = (): TypedThunk => async (dispatch) => {
  const { operations, settings } = await postMessage<{ operations: Operation[]; settings: HistorySettings }>({
    method: RPCAction.LOAD_IDENTITY_HISTORY,
  });
  dispatch(setOperations(operations));
  dispatch(setSettings(settings));
};

export const getHistory = (): TypedThunk => async (dispatch) => {
  const operations = await postMessage<Operation[]>({ method: RPCAction.GET_IDENTITY_HISTORY });
  dispatch(setOperations(operations));
};

export const deleteHistoryOperation =
  (id: string): TypedThunk =>
  async (dispatch) => {
    const operations = await postMessage<Operation[]>({ method: RPCAction.DELETE_HISTORY_OPERATION, payload: id });
    dispatch(setOperations(operations));
  };

export const clearHistory = (): TypedThunk => async (dispatch) => {
  await postMessage<Operation[]>({ method: RPCAction.DELETE_ALL_HISTORY_OPERATIONS });
  dispatch(setOperations([]));
};

export const useIdentities = (): IdentityData[] => useAppSelector((state) => state.identities.identities, deepEqual);

export const useSelectedIdentity = (): IdentityData | undefined =>
  useAppSelector((state) => {
    const { identities, selected } = state.identities;
    return identities.find(({ commitment }) => commitment === selected.commitment);
  }, deepEqual);

export const useIdentityRequestPending = (): boolean =>
  useAppSelector((state) => state.identities.requestPending, deepEqual);

export const useIdentityOperations = (): Operation[] =>
  useAppSelector((state) => state.identities.operations, deepEqual);

export const useHistorySettings = (): HistorySettings | undefined =>
  useAppSelector((state) => state.identities.settings, deepEqual);

export default identitiesSlice.reducer;
