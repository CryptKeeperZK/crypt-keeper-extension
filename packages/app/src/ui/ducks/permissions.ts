import { RPCAction } from "@cryptkeeperzk/providers";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "../store/configureAppStore";
import type { HostPermission } from "@cryptkeeperzk/types";

import { useAppSelector } from "./hooks";

export interface PermissionsState {
  canSkipApprovals: Map<string, HostPermission>;
}

const initialState: PermissionsState = {
  canSkipApprovals: new Map(),
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    setPermission: (state: PermissionsState, action: PayloadAction<HostPermission>) => {
      state.canSkipApprovals.set(action.payload.host, action.payload);
    },

    removeHostPermission: (state: PermissionsState, action: PayloadAction<string>) => {
      state.canSkipApprovals.delete(action.payload);
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
  (permission: HostPermission): TypedThunk<Promise<void>> =>
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

export const useHostPermission = (host: string): HostPermission | undefined =>
  useAppSelector((state) => state.permissions.canSkipApprovals.get(host), deepEqual);

export default permissionsSlice.reducer;
