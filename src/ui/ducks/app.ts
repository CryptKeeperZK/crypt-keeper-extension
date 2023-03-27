/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface AppState {
  initialized: boolean;
  unlocked: boolean;
}

const initialState: AppState = {
  initialized: false,
  unlocked: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setStatus: (state: AppState, action: PayloadAction<AppState>) => {
      state.initialized = action.payload.initialized;
      state.unlocked = action.payload.unlocked;
    },
  },
});

export const { setStatus } = appSlice.actions;

export const closePopup = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.CLOSE_POPUP });
};

export const unlock = (password: string) => async (): Promise<boolean> =>
  postMessage<boolean>({ method: RPCAction.UNLOCK, payload: password });

export const setupPassword = (password: string) => async (): Promise<boolean> =>
  postMessage<boolean>({ method: RPCAction.SETUP_PASSWORD, payload: password });

export const fetchStatus = (): TypedThunk => async (dispatch) => {
  const status = await postMessage<AppState>({ method: RPCAction.GET_STATUS });
  dispatch(setStatus(status));
};

export const useAppStatus = (): AppState => useAppSelector((state) => state.app, deepEqual);

export default appSlice.reducer;
