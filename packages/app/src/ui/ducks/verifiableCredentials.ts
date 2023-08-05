/* eslint-disable no-param-reassign */
import { RPCAction } from "@cryptkeeperzk/providers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { serializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential, IRenameVerifiableCredentialArgs } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface VerifiableCredentialState {
  serializedVerifiableCredentials: string[];
}

const initialState: VerifiableCredentialState = {
  serializedVerifiableCredentials: [],
};

const verifiableCredentialsSlice = createSlice({
  name: "verifiableCredentials",
  initialState,
  reducers: {
    setVerifiableCredentials: (state: VerifiableCredentialState, action: PayloadAction<string[]>) => {
      state.serializedVerifiableCredentials = action.payload;
    },
  },
});

export const { setVerifiableCredentials } = verifiableCredentialsSlice.actions;

export const addVerifiableCredential = (serializedVerifiableCredential: string) => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.ADD_VERIFIABLE_CREDENTIAL,
    payload: serializedVerifiableCredential,
  });
};

export const rejectVerifiableCredentialRequest =
  (serializedVerifiableCredential: string) => async (): Promise<void> => {
    await postMessage({
      method: RPCAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
      payload: serializedVerifiableCredential,
    });
  };

export const renameVerifiableCredential =
  (renameVerifiableCredentialArgs: IRenameVerifiableCredentialArgs) => async (): Promise<void> => {
    console.log("renaming vc", renameVerifiableCredentialArgs);

    await postMessage({
      method: RPCAction.RENAME_VERIFIABLE_CREDENTIAL,
      payload: renameVerifiableCredentialArgs,
    });
  };

export const deleteVerifiableCredential = (verifiableCredentialHash: string) => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.DELETE_VERIFIABLE_CREDENTIAL,
    payload: verifiableCredentialHash,
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
  useAppSelector((state) => state.verifiableCredentials.serializedVerifiableCredentials);

export default verifiableCredentialsSlice.reducer;
