import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCInternalAction } from "@src/constants";
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
      state.canSkipApprovals[action.payload.urlOrigin] = action.payload;
    },

    removeHostPermission: (state: IPermissionsState, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, no-param-reassign
      delete state.canSkipApprovals[action.payload];
    },
  },
});

const { setPermission, removeHostPermission } = permissionsSlice.actions;

export const fetchHostPermissions =
  (urlOrigin: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    const res = await postMessage<{ canSkipApprove: boolean }>({
      method: RPCInternalAction.GET_HOST_PERMISSIONS,
      payload: urlOrigin,
    });

    dispatch(setPermission({ urlOrigin, canSkipApprove: res.canSkipApprove }));
  };

export const setHostPermissions =
  (permission: IHostPermission): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage<{ canSkipApprove: boolean }>({
      method: RPCInternalAction.SET_HOST_PERMISSIONS,
      payload: {
        urlOrigin: permission.urlOrigin,
        canSkipApprove: permission.canSkipApprove,
      },
    });

    dispatch(setPermission(permission));
  };

export const removeHost =
  (urlOrigin: string): TypedThunk<Promise<void>> =>
  async (dispatch) => {
    await postMessage({
      method: RPCInternalAction.REMOVE_HOST,
      payload: {
        urlOrigin,
      },
    });

    dispatch(removeHostPermission(urlOrigin));
  };

export const checkHostApproval =
  (urlOrigin: string): TypedThunk<Promise<boolean>> =>
  async () =>
    postMessage({
      method: RPCInternalAction.IS_HOST_APPROVED,
      payload: urlOrigin,
    });

export const useHostPermission = (urlOrigin: string): IHostPermission | undefined =>
  useAppSelector((state) => state.permissions.canSkipApprovals[urlOrigin], deepEqual);

export default permissionsSlice.reducer;
