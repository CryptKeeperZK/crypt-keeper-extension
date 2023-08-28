/* eslint-disable no-param-reassign */
import { RPCAction } from "@cryptkeeperzk/providers";
import { IPendingRequest, IRequestResolutionAction } from "@cryptkeeperzk/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IRequestsState {
  pendingRequests: IPendingRequest[];
}

const initialState: IRequestsState = {
  pendingRequests: [],
};

const requestsSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {
    setPendingRequests: (state: IRequestsState, action: PayloadAction<IPendingRequest[]>) => {
      state.pendingRequests = action.payload;
    },
  },
});

export const { setPendingRequests } = requestsSlice.actions;

export const fetchPendingRequests = (): TypedThunk => async (dispatch) => {
  const pendingRequests = await postMessage<IPendingRequest[]>({ method: RPCAction.GET_PENDING_REQUESTS });
  dispatch(setPendingRequests(pendingRequests));
};

export const finalizeRequest =
  (request: IRequestResolutionAction): TypedThunk<Promise<boolean>> =>
  async (): Promise<boolean> =>
    postMessage({
      method: RPCAction.FINALIZE_REQUEST,
      payload: request,
    });

export const usePendingRequests = (): IPendingRequest[] =>
  useAppSelector((state) => state.requests.pendingRequests, deepEqual);

export default requestsSlice.reducer;
