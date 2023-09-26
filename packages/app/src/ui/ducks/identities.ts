/* eslint-disable no-param-reassign */
import {
  ICreateIdentityUiArgs,
  IIdentityData,
  ICreateIdentityRequestArgs,
  ConnectedIdentityMetadata,
  IConnectIdentityArgs,
} from "@cryptkeeperzk/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCInternalAction } from "@src/constants";
import { Operation, HistorySettings } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IIdentitiesState {
  identities: IIdentityData[];
  operations: Operation[];
  requestPending: boolean;
  connectedCommitment: string;
  connectedMetadata?: ConnectedIdentityMetadata;
  settings?: HistorySettings;
}

const initialState: IIdentitiesState = {
  identities: [],
  operations: [],
  settings: undefined,
  requestPending: false,
  connectedCommitment: "",
  connectedMetadata: undefined,
};

const identitiesSlice = createSlice({
  name: "identities",
  initialState,
  reducers: {
    setConnectedIdentity: (state: IIdentitiesState, action: PayloadAction<ConnectedIdentityMetadata | undefined>) => {
      state.connectedMetadata = action.payload;
    },

    setConnectedCommitment: (state: IIdentitiesState, action: PayloadAction<string>) => {
      state.connectedCommitment = action.payload;
    },

    setIdentityRequestPending: (state: IIdentitiesState, action: PayloadAction<boolean>) => {
      state.requestPending = action.payload;
    },

    setIdentities: (state: IIdentitiesState, action: PayloadAction<IIdentityData[]>) => {
      state.identities = action.payload;
    },

    setOperations: (state: IIdentitiesState, action: PayloadAction<Operation[]>) => {
      state.operations = action.payload;
    },

    setSettings: (state: IIdentitiesState, action: PayloadAction<HistorySettings>) => {
      state.settings = action.payload;
    },
  },
});

export const { setConnectedIdentity, setIdentities, setIdentityRequestPending, setOperations, setSettings } =
  identitiesSlice.actions;

export const createIdentityRequest =
  ({ urlOrigin }: ICreateIdentityRequestArgs) =>
  async (): Promise<void> => {
    await postMessage({
      method: RPCInternalAction.CREATE_IDENTITY_REQUEST,
      payload: {
        urlOrigin,
      },
    });
  };

export const createIdentity =
  ({ walletType, messageSignature, isDeterministic, groups, host, options }: ICreateIdentityUiArgs) =>
  async (): Promise<string | undefined> =>
    postMessage({
      method: RPCInternalAction.CREATE_IDENTITY,
      payload: {
        walletType,
        messageSignature,
        isDeterministic,
        groups,
        urlOrigin,
        options,
      },
    });

export const connectIdentity =
  ({ identityCommitment, urlOrigin }: IConnectIdentityArgs) =>
  async (): Promise<boolean> =>
    postMessage({
      method: RPCInternalAction.CONNECT_IDENTITY,
      payload: {
        identityCommitment,
        urlOrigin,
      },
    });

export const setIdentityName = (identityCommitment: string, name: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCInternalAction.SET_IDENTITY_NAME,
    payload: {
      identityCommitment,
      name,
    },
  });

export const deleteIdentity = (identityCommitment: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCInternalAction.DELETE_IDENTITY,
    payload: {
      identityCommitment,
    },
  });

export const deleteAllIdentities = () => async (): Promise<boolean> =>
  postMessage({
    method: RPCInternalAction.DELETE_ALL_IDENTITIES,
  });

export const fetchIdentities = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const [identities, metadata, commitment] = await Promise.all([
    postMessage<IIdentityData[]>({ method: RPCInternalAction.GET_IDENTITIES }),
    postMessage<ConnectedIdentityMetadata | undefined>({
      method: RPCInternalAction.GET_CONNECTED_IDENTITY_DATA,
    }),
    postMessage<string>({ method: RPCInternalAction.GET_CONNECTED_IDENTITY_COMMITMENT }),
  ]);

  dispatch(setIdentities(identities));
  dispatch(setConnectedIdentity(metadata));
  dispatch(identitiesSlice.actions.setConnectedCommitment(commitment));
};

export const fetchHistory = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const { operations, settings } = await postMessage<{ operations: Operation[]; settings: HistorySettings }>({
    method: RPCInternalAction.LOAD_IDENTITY_HISTORY,
  });
  dispatch(setOperations(operations));
  dispatch(setSettings(settings));
};

export const deleteHistoryOperation =
  (id: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    const operations = await postMessage<Operation[]>({
      method: RPCInternalAction.DELETE_HISTORY_OPERATION,
      payload: id,
    });
    dispatch(setOperations(operations));
  };

export const clearHistory = (): TypedThunk<Promise<void>> => async (dispatch) => {
  await postMessage<Operation[]>({ method: RPCInternalAction.DELETE_ALL_HISTORY_OPERATIONS });
  dispatch(setOperations([]));
};

export const enableHistory =
  (isEnabled: boolean): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage<HistorySettings>({ method: RPCInternalAction.ENABLE_OPERATION_HISTORY, payload: isEnabled });
    dispatch(setSettings({ isEnabled }));
  };

export const revealConnectedIdentityCommitment = (): TypedThunk<Promise<void>> => async () => {
  await postMessage({ method: RPCInternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT });
};

export const useIdentities = (): IIdentityData[] => useAppSelector((state) => state.identities.identities, deepEqual);

export const useIdentity = (commitment?: string): IIdentityData | undefined =>
  useAppSelector((state) =>
    commitment ? state.identities.identities.find((identity) => identity.commitment === commitment) : undefined,
  );

export const useLinkedIdentities = (urlOrigin: string): IIdentityData[] =>
  useAppSelector(
    (state) => state.identities.identities.filter((identity) => identity.metadata.urlOrigin === urlOrigin),
    deepEqual,
  );

export const useUnlinkedIdentities = (): IIdentityData[] =>
  useAppSelector((state) => state.identities.identities.filter((identity) => !identity.metadata.urlOrigin), deepEqual);

export const useConnectedIdentity = (): IIdentityData | undefined =>
  useAppSelector((state) => {
    const { identities, connectedCommitment } = state.identities;
    return identities.find(({ commitment }) => commitment === connectedCommitment);
  }, deepEqual);

export const useIdentityRequestPending = (): boolean =>
  useAppSelector((state) => state.identities.requestPending, deepEqual);

export const useIdentityOperations = (): Operation[] =>
  useAppSelector((state) => state.identities.operations, deepEqual);

export const useHistorySettings = (): HistorySettings | undefined =>
  useAppSelector((state) => state.identities.settings, deepEqual);

export default identitiesSlice.reducer;
