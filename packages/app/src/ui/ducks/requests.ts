/* eslint-disable no-param-reassign */
import { EventName } from "@cryptkeeperzk/providers";
import { IPendingRequest, IRejectedRequest, IRequestResolutionAction } from "@cryptkeeperzk/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCInternalAction } from "@src/constants";
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

export const fetchPendingRequests = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const pendingRequests = await postMessage<IPendingRequest[]>({ method: RPCInternalAction.GET_PENDING_REQUESTS });
  dispatch(setPendingRequests(pendingRequests));
};

export const finalizeRequest =
  (request: IRequestResolutionAction): TypedThunk<Promise<boolean>> =>
  async (): Promise<boolean> =>
    postMessage({
      method: RPCInternalAction.FINALIZE_REQUEST,
      payload: request,
    });

export const rejectUserRequest =
  (payload: IRejectedRequest, urlOrigin?: string): TypedThunk<Promise<void>> =>
  async () =>
    postMessage({
      method: RPCInternalAction.PUSH_EVENT,
      payload: { type: EventName.USER_REJECT, payload },
      meta: { urlOrigin },
    });

export const usePendingRequests = (): IPendingRequest[] =>
  useAppSelector((state) => state.requests.pendingRequests, deepEqual);

export default requestsSlice.reducer;
