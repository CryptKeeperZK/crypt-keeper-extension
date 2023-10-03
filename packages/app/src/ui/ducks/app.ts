/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";
import omit from "lodash/omit";

import { RPCInternalAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { ISecretArgs } from "@src/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IAppState {
  isInitialized: boolean;
  isUnlocked: boolean;
  isMnemonicGenerated: boolean;
  mnemonic?: string;
  selectedAccount?: string;
  isDisconnectedPermanently?: boolean;
}

const initialState: IAppState = {
  isInitialized: false,
  isUnlocked: false,
  isMnemonicGenerated: false,
  mnemonic: undefined,
  isDisconnectedPermanently: undefined,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setStatus: (state: IAppState, action: PayloadAction<Omit<IAppState, "isDisconnectedPermanently">>) => {
      state.isInitialized = action.payload.isInitialized;
      state.isUnlocked = action.payload.isUnlocked;
      state.isMnemonicGenerated = action.payload.isMnemonicGenerated;
    },

    setMnemonic: (state: IAppState, action: PayloadAction<string>) => {
      state.mnemonic = action.payload;
    },

    setDisconnectedPermanently: (state: IAppState, action: PayloadAction<boolean>) => {
      state.isDisconnectedPermanently = action.payload;
    },

    setSelectedAccount: (state: IAppState, action: PayloadAction<string>) => {
      state.selectedAccount = action.payload;
    },
  },
});

export const { setStatus, setSelectedAccount } = appSlice.actions;

export const lock = () => async (): Promise<void> => {
  await postMessage({ method: RPCInternalAction.LOCK });
};

export const closePopup = () => async (): Promise<void> => {
  await postMessage({ method: RPCInternalAction.CLOSE_POPUP });
};

export const unlock = (password: string) => async (): Promise<boolean> =>
  postMessage<boolean>({ method: RPCInternalAction.UNLOCK, payload: password });

export const setupPassword = (password: string) => async (): Promise<boolean> =>
  postMessage<boolean>({ method: RPCInternalAction.SETUP_PASSWORD, payload: password });

export const resetPassword =
  ({ mnemonic, password }: ISecretArgs) =>
  async (): Promise<void> =>
    postMessage({ method: RPCInternalAction.RESET_PASSWORD, payload: { password, mnemonic } });

export const fetchStatus = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const status = await postMessage<IAppState>({ method: RPCInternalAction.GET_STATUS });
  dispatch(setStatus(status));
};

export const setWalletConnection =
  (isDisconnectedPermanently: boolean): TypedThunk =>
  async (dispatch): Promise<void> => {
    await postMessage({ method: RPCInternalAction.SET_CONNECT_WALLET, payload: { isDisconnectedPermanently } });
    dispatch(appSlice.actions.setDisconnectedPermanently(isDisconnectedPermanently));
  };

export const getWalletConnection =
  (): TypedThunk =>
  async (dispatch): Promise<void> => {
    const response = await postMessage<{ isDisconnectedPermanently?: boolean } | null | undefined>({
      method: RPCInternalAction.GET_CONNECT_WALLET,
    });
    dispatch(appSlice.actions.setDisconnectedPermanently(Boolean(response?.isDisconnectedPermanently)));
  };

export const generateMnemonic =
  (userMnemonic?: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    const mnemonic = await postMessage<string>({ method: RPCInternalAction.GENERATE_MNEMONIC, payload: userMnemonic });
    dispatch(appSlice.actions.setMnemonic(mnemonic));
  };

export const saveMnemonic = (): TypedThunk<Promise<void>> => async (dispatch) => {
  await postMessage({ method: RPCInternalAction.SAVE_MNEMONIC });
  dispatch(setStatus({ isInitialized: true, isUnlocked: true, isMnemonicGenerated: true }));
  dispatch(appSlice.actions.setMnemonic(""));
};

export const getSelectedAccount = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const account = await postMessage<string>({ method: RPCInternalAction.GET_SELECTED_ACCOUNT });
  dispatch(setSelectedAccount(account));
};

export const selectAccount =
  (address: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage({ method: RPCInternalAction.SELECT_ACCOUNT, payload: address });
    dispatch(setSelectedAccount(address));
  };

export const checkMnemonic =
  (mnemonic: string): TypedThunk<Promise<boolean>> =>
  () =>
    postMessage({ method: RPCInternalAction.CHECK_MNEMONIC, payload: { mnemonic, strict: true } });

export const checkPassword =
  (password: string): TypedThunk<Promise<boolean>> =>
  () =>
    postMessage<boolean>({ method: RPCInternalAction.CHECK_PASSWORD, payload: { password } });

export const getMnemonic = (): TypedThunk<Promise<string>> => () =>
  postMessage<string>({ method: RPCInternalAction.GET_MNEMONIC });

export const deleteStorage = (): TypedThunk<Promise<void>> => () =>
  postMessage({ method: RPCInternalAction.CLEAR_STORAGE });

export const useGeneratedMnemonic = (): string | undefined => useAppSelector((state) => state.app.mnemonic, deepEqual);

export const useAppStatus = (): Omit<IAppState, "mnemonic"> =>
  useAppSelector((state) => omit(state.app, ["mnemonic"]), deepEqual);

export default appSlice.reducer;
