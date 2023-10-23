/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RPCInternalAction } from "@src/constants";
import { serializeCryptkeeperVerifiableCredential } from "@src/util/credentials";
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

export const addVerifiableCredential =
  (serializedVerifiableCredential: string, verifiableCredentialName: string) => async (): Promise<void> =>
    postMessage({
      method: RPCInternalAction.ADD_VERIFIABLE_CREDENTIAL,
      payload: {
        serializedVerifiableCredential,
        verifiableCredentialName,
      },
    });

export const rejectVerifiableCredentialRequest = () => async (): Promise<void> => {
  await postMessage({
    method: RPCInternalAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
  });
};

export const renameVerifiableCredential =
  (renameVerifiableCredentialArgs: IRenameVerifiableCredentialArgs) => async (): Promise<void> => {
    await postMessage({
      method: RPCInternalAction.RENAME_VERIFIABLE_CREDENTIAL,
      payload: renameVerifiableCredentialArgs,
    });
  };

export const deleteVerifiableCredential = (verifiableCredentialHash: string) => async (): Promise<void> => {
  await postMessage({
    method: RPCInternalAction.DELETE_VERIFIABLE_CREDENTIAL,
    payload: verifiableCredentialHash,
  });
};

export const generateVerifiablePresentation =
  (verifiablePresentation: IVerifiablePresentation) => async (): Promise<void> => {
    await postMessage({
      method: RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION,
      payload: verifiablePresentation,
    });
  };

export const generateVerifiablePresentationWithCryptkeeper =
  (generateVerifiablePresentationArgs: IGenerateVerifiablePresentationWithCryptkeeperArgs) =>
  async (): Promise<void> => {
    await postMessage({
      method: RPCInternalAction.GENERATE_VERIFIABLE_PRESENTATION_WITH_CRYPTKEEPER,
      payload: generateVerifiablePresentationArgs,
    });
  };

export const rejectVerifiablePresentationRequest = () => async (): Promise<void> => {
  await postMessage({
    method: RPCInternalAction.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
  });
};

export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVerifiableCredentials = await postMessage<ICryptkeeperVerifiableCredential[]>({
    method: RPCInternalAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  const serializedVerifiableCredentials = cryptkeeperVerifiableCredentials.map((cryptkeeperVerifiableCredential) =>
    serializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential),
  );

  dispatch(setVerifiableCredentials(serializedVerifiableCredentials));
};

export const useVerifiableCredentials = (): string[] =>
  useAppSelector((state) => state.verifiableCredentials.serializedVerifiableCredentials);

export default verifiableCredentialsSlice.reducer;
