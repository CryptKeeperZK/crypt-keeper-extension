/* eslint-disable no-param-reassign */
import { RPCAction } from "@cryptkeeperzk/providers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { serializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import {
  CryptkeeperVerifiableCredential,
  IDeleteVerifiableCredentialArgs,
  IRenameVerifiableCredentialArgs,
} from "@src/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface VerifiableCredentialState {
  verifiableCredentials: string[];
}

const initialState: VerifiableCredentialState = {
  verifiableCredentials: [],
};

const verifiableCredentialsSlice = createSlice({
  name: "verifiableCredentials",
  initialState,
  reducers: {
    setVerifiableCredentials: (state: VerifiableCredentialState, action: PayloadAction<string[]>) => {
      state.verifiableCredentials = action.payload;
    },
  },
});

export const { setVerifiableCredentials } = verifiableCredentialsSlice.actions;

export const renameVerifiableCredential =
  (renameVerifiableCredentialArgs: IRenameVerifiableCredentialArgs) => async (): Promise<void> => {
    await postMessage({
      method: RPCAction.RENAME_VERIFIABLE_CREDENTIAL,
      payload: {
        renameVerifiableCredentialArgs,
      },
    });
  };

export const deleteVerifiableCredential =
  ({ verifiableCredentialHash }: IDeleteVerifiableCredentialArgs) =>
  async (): Promise<void> => {
    await postMessage({
      method: RPCAction.DELETE_VERIFIABLE_CREDENTIAL,
      payload: {
        verifiableCredentialHash,
      },
    });
  };

export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVerifiableCredentials = await postMessage<CryptkeeperVerifiableCredential[]>({
    method: RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  const serializedVerifiableCredentials = cryptkeeperVerifiableCredentials.map((cryptkeeperVerifiableCredential) =>
    serializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential),
  );

  dispatch(setVerifiableCredentials(serializedVerifiableCredentials));
};

export const useVerifiableCredentials = (): string[] =>
  useAppSelector((state) => state.verifiableCredentials.verifiableCredentials);

export default verifiableCredentialsSlice.reducer;
