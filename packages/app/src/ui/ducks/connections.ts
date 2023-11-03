/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCInternalAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import type { IConnectIdentityArgs, IIdentityConnection } from "@cryptkeeperzk/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IConnectionsState {
  connections: Record<string, IIdentityConnection>;
}

const initialState: IConnectionsState = {
  connections: {},
};

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    setConnections: (state: IConnectionsState, action: PayloadAction<Record<string, IIdentityConnection>>) => {
      state.connections = action.payload;
    },
  },
});

export const { setConnections } = connectionsSlice.actions;

export const connect =
  ({ commitment, urlOrigin }: IConnectIdentityArgs) =>
  async (): Promise<boolean> =>
    postMessage({
      method: RPCInternalAction.CONNECT,
      payload: {
        commitment,
      },
      meta: {
        urlOrigin,
      },
    });

export const fetchConnections = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const connections = await postMessage<Record<string, IIdentityConnection>>({
    method: RPCInternalAction.GET_CONNECTIONS,
    payload: {},
  });

  dispatch(setConnections(connections));
};

export const revealConnectedIdentityCommitment =
  (urlOrigin: string): TypedThunk<Promise<void>> =>
  async () => {
    await postMessage({
      method: RPCInternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
      payload: {},
      meta: { urlOrigin },
    });
  };

export const useConnections = (): Record<string, IIdentityConnection> =>
  useAppSelector((state) => state.connections.connections, deepEqual);

export const useConnectedOrigins = (): Record<string, string> =>
  useAppSelector(
    (state) =>
      Object.entries(state.connections.connections).reduce<Record<string, string>>(
        (acc, [urlOrigin, { commitment }]) => {
          acc[commitment] = urlOrigin;

          return acc;
        },
        {},
      ),
    deepEqual,
  );

export const useConnection = (urlOrigin?: string): IIdentityConnection | undefined =>
  useAppSelector((state) => (urlOrigin ? state.connections.connections[urlOrigin] : undefined), deepEqual);

export default connectionsSlice.reducer;
