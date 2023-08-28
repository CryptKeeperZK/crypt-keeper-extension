import { RPCAction } from "@cryptkeeperzk/providers";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "../store/configureAppStore";
import type { IHostPermission } from "@cryptkeeperzk/types";

import { useAppSelector } from "./hooks";

export interface IPermissionsState {
  canSkipApprovals: Record<string, IHostPermission>;
}

const initialState: IPermissionsState = {
  canSkipApprovals: {},
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermission: (state: IPermissionsState, action: PayloadAction<IHostPermission>) => {
      // eslint-disable-next-line no-param-reassign
      state.canSkipApprovals[action.payload.host] = action.payload;
    },

    removeHostPermission: (state: IPermissionsState, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, no-param-reassign
      delete state.canSkipApprovals[action.payload];
    },
  },
});

const { setPermission, removeHostPermission } = permissionsSlice.actions;

export const fetchHostPermissions =
  (host: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    const res = await postMessage<{ canSkipApprove: boolean }>({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: host,
    });

    dispatch(setPermission({ host, canSkipApprove: res.canSkipApprove }));
  };

export const setHostPermissions =
  (permission: IHostPermission): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage<{ canSkipApprove: boolean }>({
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host: permission.host,
        canSkipApprove: permission.canSkipApprove,
      },
    });

    dispatch(setPermission(permission));
  };

export const removeHost =
  (host: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage({
      method: RPCAction.REMOVE_HOST,
      payload: {
        host,
      },
    });

    dispatch(removeHostPermission(host));
  };

export const checkHostApproval =
  (host: string): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCAction.IS_HOST_APPROVED,
      payload: host,
    });

export const useHostPermission = (host: string): IHostPermission | undefined =>
  useAppSelector((state) => state.permissions.canSkipApprovals[host], deepEqual);

export default permissionsSlice.reducer;
