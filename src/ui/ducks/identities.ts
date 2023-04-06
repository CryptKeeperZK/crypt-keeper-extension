/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import deepEqual from "fast-deep-equal";

import { RPCAction } from "@src/constants";
import { CreateIdentityOptions, IdentityMetadata, IdentityStrategy } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface IdentitiesState {
  identities: IdentityData[];
  requestPending: boolean;
  selected: SelectedIdentity; // This aim to be a short-term solution to the integration with Zkitter
}

export interface IdentityData {
  commitment: string;
  metadata: IdentityMetadata;
}

export interface SelectedIdentity {
  commitment: string;
  web2Provider?: string;
}

const initialState: IdentitiesState = {
  identities: [],
  requestPending: false,
  selected: {
    commitment: "",
    web2Provider: ""
  }
};

const identitiesSlice = createSlice({
  name: "identities",
  initialState,
  reducers: {
    setSelectedCommitment: (state: IdentitiesState, action: PayloadAction<SelectedIdentity>) => {
      state.selected = {
        commitment: action.payload.commitment,
        web2Provider: action.payload.web2Provider
      }
    },

    setIdentityRequestPending: (state: IdentitiesState, action: PayloadAction<boolean>) => {
      state.requestPending = action.payload;
    },

    setIdentities: (state: IdentitiesState, action: PayloadAction<IdentityData[]>) => {
      state.identities = action.payload;
    },
  },
});

export const { setSelectedCommitment, setIdentities, setIdentityRequestPending } = identitiesSlice.actions;

export const createIdentityRequest = () => async (): Promise<void> => {
  await postMessage({ method: RPCAction.CREATE_IDENTITY_REQ });
};

export const createIdentity =
  (strategy: IdentityStrategy, messageSignature: string, options: CreateIdentityOptions) =>
    async (): Promise<boolean> =>
      postMessage({
        method: RPCAction.CREATE_IDENTITY,
        payload: {
          strategy,
          messageSignature,
          options,
        },
      });

export const setActiveIdentity = (identityCommitment: string) => async (): Promise<boolean> =>
  postMessage({
    method: RPCAction.SET_ACTIVE_IDENTITY,
    payload: {
      identityCommitment,
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
  const { commitment, web2Provider } = await postMessage<SelectedIdentity>({ method: RPCAction.GET_ACTIVE_IDENTITY_DATA });
  dispatch(setIdentities(data));
  dispatch(setSelectedCommitment({
    commitment,
    web2Provider
  }));
};

export const useIdentities = (): IdentityData[] => useAppSelector((state) => state.identities.identities, deepEqual);

export const useSelectedIdentity = (): IdentityData | undefined =>
  useAppSelector((state) => {
    const { identities, selected } = state.identities;
    return identities.find(({ commitment }) => commitment === selected.commitment);
  }, deepEqual);

export const useIdentityRequestPending = (): boolean =>
  useAppSelector((state) => state.identities.requestPending, deepEqual);

export default identitiesSlice.reducer;
