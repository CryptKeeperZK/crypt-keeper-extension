/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { PendingRequest, RequestResolutionAction } from "@src/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface RequestsState {
  pendingRequests: PendingRequest[];
}

const initialState: RequestsState = {
  pendingRequests: [],
};

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setPendingRequests: (state: RequestsState, action: PayloadAction<PendingRequest[]>) => {
      state.pendingRequests = action.payload;
    },
  },
});

export const { setPendingRequests } = requestsSlice.actions;

export const fetchPendingRequests = (): TypedThunk => async (dispatch) => {
  const pendingRequests = await postMessage<PendingRequest[]>({ method: RPCAction.GET_PENDING_REQUESTS });
  dispatch(setPendingRequests(pendingRequests));
};

export const finalizeRequest =
  (request: RequestResolutionAction): TypedThunk<Promise<boolean>> =>
  async (): Promise<boolean> =>
    postMessage({
      method: RPCAction.FINALIZE_REQUEST,
      payload: request,
    });

export const usePendingRequests = (): PendingRequest[] =>
  useAppSelector((state) => state.requests.pendingRequests, deepEqual);

export default requestsSlice.reducer;
