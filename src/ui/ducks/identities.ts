/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCAction } from "@src/constants";
import { HistorySettings, ICreateIdentityUiArgs, IdentityData, Operation, SelectedIdentity } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IdentitiesState {
  identities: IdentityData[];
  hostIdentities: IdentityData[];
  randomIdentities: IdentityData[];
  operations: Operation[];
  requestPending: boolean;
  selected: SelectedIdentity; // This aim to be a short-term solution to the integration with Zkitter
  selectedToConnect: SelectedIdentity;
  connected: SelectedIdentity;
  notReadyToConnect: boolean;
  settings?: HistorySettings;
  host?: string;
}

const initialState: IdentitiesState = {
  identities: [],
  hostIdentities: [],
  randomIdentities: [],
  operations: [],
  settings: undefined,
  requestPending: false,
  selected: {
    commitment: "",
    web2Provider: "",
    host: "",
  },
  selectedToConnect: {
    commitment: "",
    host: "",
  },
  connected: {
    commitment: "",
    host: "",
  },
  notReadyToConnect: true,
  host: "",
};

const identitiesSlice = createSlice({
  name: "identities",
  initialState,
  reducers: {
    setSelectedCommitment: (state: IdentitiesState, action: PayloadAction<SelectedIdentity>) => {
      state.selected = {
        commitment: action.payload.commitment,
        web2Provider: action.payload.web2Provider,
      };
    },

    setConnectedCommitment: (state: IdentitiesState, action: PayloadAction<SelectedIdentity>) => {
      state.selected = {
        commitment: action.payload.commitment,
        host: action.payload.host,
      };
    },

    setSelectedToConnect: (state: IdentitiesState, action: PayloadAction<SelectedIdentity>) => {
      state.selectedToConnect = {
        commitment: action.payload.commitment,
        host: action.payload.host,
      };
    },

    setNotReadyToConnect: (state: IdentitiesState, action: PayloadAction<boolean>) => {
      state.notReadyToConnect = action.payload;
    },

    setIdentityRequestPending: (state: IdentitiesState, action: PayloadAction<boolean>) => {
      state.requestPending = action.payload;
    },

    setIdentities: (state: IdentitiesState, action: PayloadAction<IdentityData[]>) => {
      state.identities = action.payload;
    },

    setHostIdentities: (state: IdentitiesState, action: PayloadAction<IdentityData[]>) => {
      state.hostIdentities = action.payload;
    },

    setRandomIdentities: (state: IdentitiesState, action: PayloadAction<IdentityData[]>) => {
      state.randomIdentities = action.payload;
    },

    setOperations: (state: IdentitiesState, action: PayloadAction<Operation[]>) => {
      state.operations = action.payload;
    },

    setSettings: (state: IdentitiesState, action: PayloadAction<HistorySettings>) => {
      state.settings = action.payload;
    },

    setIdentityHost: (state: IdentitiesState, action: PayloadAction<string | undefined>) => {
      state.host = action.payload;
    },
  },
});

export const {
  setSelectedCommitment,
  setConnectedCommitment,
  setSelectedToConnect,
  setNotReadyToConnect,
  setIdentities,
  setHostIdentities,
  setIdentityRequestPending,
  setOperations,
  setSettings,
  setIdentityHost,
  setRandomIdentities,
} = identitiesSlice.actions;

export const createIdentityRequest = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.CREATE_IDENTITY_REQ });
};

export const createIdentity =
  ({ walletType, strategy, messageSignature, options, host }: ICreateIdentityUiArgs) =>
    async (): Promise<string | undefined> => {
      const commitment = await postMessage<string | undefined>({
        method: RPCAction.CREATE_IDENTITY,
        payload: {
          strategy,
          walletType,
          messageSignature,
          options,
          host,
        },
      });
      // A special case, when user connects and then choose to "+ Create a new identity and Connect" button.
      // This will automatically select this to be the connected one directly and then finish the connection. 
      if (commitment) {
        setSelectedToConnect({
          commitment,
          host
        });
      }
      return commitment;
    }

// export const createIdentity =
//   ({ walletType, strategy, messageSignature, options, host }: ICreateIdentityUiArgs) =>
//     async (): Promise<string | undefined> => postMessage<string | undefined>({
//       method: RPCAction.CREATE_IDENTITY,
//       payload: {
//         strategy,
//         walletType,
//         messageSignature,
//         options,
//         host,
//       },
//     })

export const setActiveIdentity = (identityCommitment: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.SET_ACTIVE_IDENTITY,
    payload: {
      identityCommitment,
    },
  });

export const setConnectedIdentity = (identityCommitment: string, host: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.SET_CONNECTED_IDENTITY,
    payload: {
      identityCommitment,
      host,
    },
  });

export const setIdentityName = (identityCommitment: string, name: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.SET_IDENTITY_NAME,
    payload: {
      identityCommitment,
      name,
    },
  });

export const deleteIdentity = (identityCommitment: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.DELETE_IDENTITY,
    payload: {
      identityCommitment,
    },
  });

export const deleteAllIdentities = () => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.DELETE_ALL_IDENTITIES,
  });

export const fetchIdentities = (): TypedThunk => async (dispatch) => {
  const data = await postMessage<IdentityData[]>({ method: RPCAction.GET_IDENTITIES });
  dispatch(setIdentities(data));

  // TODO `RPCAction.GET_ACTIVE_IDENTITY_DATA` will be deprecated and moved to connected identity depending on the host opened.
  //      After the user connected to an app (host), the connected identity will be marked automatically.
  //      And when the user open the extension to another pagw (window) (host):
  //       - if this host is connected, the connected identity will be selected.
  //       - if not connected, no identity will be selected for this host, until the user make a connection with this host first.
  //      This feature would be implemented in another PR depending on the team discussion.
  // const { commitment, web2Provider } = await postMessage<SelectedIdentity>({
  //   method: RPCAction.GET_ACTIVE_IDENTITY_DATA,
  // });
  // dispatch(
  //   setSelectedCommitment({
  //     commitment,
  //     web2Provider,
  //   }),
  // );
};

export const fetchHostIdentities =
  (host: string): TypedThunk =>
    async (dispatch) => {
      const data = await postMessage<IdentityData[]>({
        method: RPCAction.GET_HOST_IDENTITIES,
        payload: {
          host,
        },
      });

      console.log("Data", data);
      dispatch(setHostIdentities(data));
    };

export const fetchRandomIdentities = (): TypedThunk => async (dispatch) => {
  const data = await postMessage<IdentityData[]>({
    method: RPCAction.GET_RANDOM_IDENTITIES,
  });

  dispatch(setRandomIdentities(data));
};

export const fetchHistory = (): TypedThunk<Promise<void>> => async (dispatch) => {
  const { operations, settings } = await postMessage<{ operations: Operation[]; settings: HistorySettings }>({
    method: RPCAction.LOAD_IDENTITY_HISTORY,
  });
  dispatch(setOperations(operations));
  dispatch(setSettings(settings));
};

export const getHistory = (): TypedThunk => async (dispatch) => {
  const operations = await postMessage<Operation[]>({ method: RPCAction.GET_IDENTITY_HISTORY });
  dispatch(setOperations(operations));
};

export const deleteHistoryOperation =
  (id: string): TypedThunk<Promise<void>> =>
    async (dispatch) => {
      const operations = await postMessage<Operation[]>({ method: RPCAction.DELETE_HISTORY_OPERATION, payload: id });
      dispatch(setOperations(operations));
    };

export const clearHistory = (): TypedThunk<Promise<void>> => async (dispatch) => {
  await postMessage<Operation[]>({ method: RPCAction.DELETE_ALL_HISTORY_OPERATIONS });
  dispatch(setOperations([]));
};

export const enableHistory =
  (isEnabled: boolean): TypedThunk<Promise<void>> =>
    async (dispatch) => {
      await postMessage<HistorySettings>({ method: RPCAction.ENABLE_OPERATION_HISTORY, payload: isEnabled });
      dispatch(setSettings({ isEnabled }));
    };

export const useIdentities = (): IdentityData[] => useAppSelector((state) => state.identities.identities, deepEqual);

export const useHostIdentities = (): IdentityData[] =>
  useAppSelector((state) => state.identities.hostIdentities, deepEqual);

export const useRandomIdentities = (): IdentityData[] =>
  useAppSelector((state) => state.identities.randomIdentities, deepEqual);

export const useSelectedIdentity = (): IdentityData | undefined =>
  useAppSelector((state) => {
    const { identities, selected } = state.identities;
    return identities.find(({ commitment }) => commitment === selected.commitment);
  }, deepEqual);

export const useConnectedIdentity = (): IdentityData | undefined =>
  useAppSelector((state) => {
    const { identities, connected } = state.identities;
    return identities.find(({ commitment }) => commitment === connected.commitment);
  }, deepEqual);

export const useSelectedToConnect = (): SelectedIdentity => useAppSelector((state) => state.identities.selectedToConnect, deepEqual);

export const useNotReadyToConnect = (): boolean => useAppSelector((state) => state.identities.notReadyToConnect, deepEqual);

export const useIdentityRequestPending = (): boolean =>
  useAppSelector((state) => state.identities.requestPending, deepEqual);

export const useIdentityOperations = (): Operation[] =>
  useAppSelector((state) => state.identities.operations, deepEqual);

export const useHistorySettings = (): HistorySettings | undefined =>
  useAppSelector((state) => state.identities.settings, deepEqual);

export const useIdentityHost = (): string | undefined => useAppSelector((state) => state.identities.host, deepEqual);

export default identitiesSlice.reducer;
