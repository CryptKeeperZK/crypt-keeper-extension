/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCInternalAction } from "@src/constants";
import { Operation, HistorySettings } from "@src/types";
import postMessage from "@src/util/postMessage";

import type {
  ICreateIdentityUiArgs,
  IIdentityData,
  ICreateIdentityRequestArgs,
  IImportIdentityArgs,
} from "@cryptkeeperzk/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IIdentitiesState {
  identities: IIdentityData[];
  operations: Operation[];
  requestPending: boolean;
  settings?: HistorySettings;
}

const initialState: IIdentitiesState = {
  identities: [],
  operations: [],
  settings: undefined,
  requestPending: false,
};

const identitiesSlice = createSlice({
  name: "identities",
  initialState,
  reducers: {
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

export const { setIdentities, setIdentityRequestPending, setOperations, setSettings } = identitiesSlice.actions;

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
  ({ walletType, messageSignature, isDeterministic, groups, urlOrigin, options }: ICreateIdentityUiArgs) =>
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

export const importIdentity = (payload: IImportIdentityArgs) => async (): Promise<string> =>
  postMessage({
    method: RPCInternalAction.IMPORT_IDENTITY,
    payload,
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
  const [identities] = await Promise.all([postMessage<IIdentityData[]>({ method: RPCInternalAction.GET_IDENTITIES })]);

  dispatch(setIdentities(identities));
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

export const useIdentities = (): IIdentityData[] => useAppSelector((state) => state.identities.identities, deepEqual);

export const useIdentity = (commitment?: string): IIdentityData | undefined =>
  useAppSelector((state) =>
    commitment ? state.identities.identities.find((identity) => identity.commitment === commitment) : undefined,
  );

export const useIdentityRequestPending = (): boolean =>
  useAppSelector((state) => state.identities.requestPending, deepEqual);

export const useIdentityOperations = (): Operation[] =>
  useAppSelector((state) => state.identities.operations, deepEqual);

export const useHistorySettings = (): HistorySettings | undefined =>
  useAppSelector((state) => state.identities.settings, deepEqual);

export default identitiesSlice.reducer;
