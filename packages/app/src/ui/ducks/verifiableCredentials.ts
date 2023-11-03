/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RPCInternalAction } from "@src/constants";
import { serializeCryptkeeperVC } from "@src/util/credentials";
import postMessage from "@src/util/postMessage";

import type { IVerifiablePresentation } from "@cryptkeeperzk/types";
import type {
  ICryptkeeperVerifiableCredential,
  IGenerateVerifiablePresentationWithCryptkeeperArgs,
  IRenameVerifiableCredentialArgs,
} from "@src/types";
import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface VerifiableCredentialState {
  serializedVCs: string[];
}

const initialState: VerifiableCredentialState = {
  serializedVCs: [],
};

const verifiableCredentialsSlice = createSlice({
  name: "verifiableCredentials",
  initialState,
  reducers: {
    setVCs: (state: VerifiableCredentialState, action: PayloadAction<string[]>) => {
      state.serializedVCs = action.payload;
    },
  },
});

export const { setVCs } = verifiableCredentialsSlice.actions;

export const addVC = (serialized: string, name: string, urlOrigin: string) => async (): Promise<void> =>
  postMessage({
    method: RPCInternalAction.ADD_VERIFIABLE_CREDENTIAL,
    payload: {
      serialized,
      name,
    },
    meta: {
      urlOrigin,
    },
  });

export const renameVC = (payload: IRenameVerifiableCredentialArgs) => async (): Promise<void> => {
  await postMessage({
    method: RPCInternalAction.RENAME_VERIFIABLE_CREDENTIAL,
    payload,
  });
};

export const deleteVC = (payload: string) => async (): Promise<void> => {
  await postMessage({
    method: RPCInternalAction.DELETE_VERIFIABLE_CREDENTIAL,
    payload,
  });
};

export const generateVP = (payload: IVerifiablePresentation, urlOrigin: string) => async (): Promise<void> => {
  await postMessage({
    method: RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION,
    payload,
    meta: {
      urlOrigin,
    },
  });
};

export const generateVPWithCryptkeeper =
  (payload: IGenerateVerifiablePresentationWithCryptkeeperArgs, urlOrigin: string) => async (): Promise<void> => {
    await postMessage({
      method: RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION_WITH_CRYPTKEEPER,
      payload,
      meta: {
        urlOrigin,
      },
    });
  };

export const fetchVCs = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVCs = await postMessage<ICryptkeeperVerifiableCredential[]>({
    method: RPCInternalAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  const serialized = cryptkeeperVCs.map((vc) => serializeCryptkeeperVC(vc));

  dispatch(setVCs(serialized));
};

export const useVCs = (): string[] => useAppSelector((state) => state.verifiableCredentials.serializedVCs);

export default verifiableCredentialsSlice.reducer;
