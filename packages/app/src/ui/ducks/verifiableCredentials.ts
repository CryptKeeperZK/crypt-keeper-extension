/* eslint-disable no-param-reassign */
import { RPCAction } from "@cryptkeeperzk/providers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { serializeCryptkeeperVC } from "@src/background/services/credentials/utils";
import postMessage from "@src/util/postMessage";

import type { IVerifiablePresentation } from "@cryptkeeperzk/types";
import type { ICryptkeeperVerifiableCredential, ISignVPArgs, IRenameVCArgs } from "@src/types";
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
      method: RPCAction.ADD_VERIFIABLE_CREDENTIAL,
      payload: {
        serializedVerifiableCredential,
        verifiableCredentialName,
      },
    });

export const rejectVerifiableCredentialRequest = () => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
  });
};

export const renameVerifiableCredential =
  (renameVerifiableCredentialArgs: IRenameVCArgs) => async (): Promise<void> => {
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

export const generateVerifiablePresentation =
  (verifiablePresentation: IVerifiablePresentation) => async (): Promise<void> => {
    await postMessage({
      method: RPCAction.ANNOUNCE_VERIFIABLE_PRESENTATION,
      payload: verifiablePresentation,
    });
  };

export const generateVerifiablePresentationWithCryptkeeper =
  (generateVerifiablePresentationArgs: ISignVPArgs) => async (): Promise<void> => {
    await postMessage({
      method: RPCAction.SIGN_AND_ANNOUNCE_VERIFIABLE_PRESENTATION,
      payload: generateVerifiablePresentationArgs,
    });
  };

export const rejectVerifiablePresentationRequest = () => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
  });
};

export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVerifiableCredentials = await postMessage<ICryptkeeperVerifiableCredential[]>({
    method: RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  const serializedVerifiableCredentials = cryptkeeperVerifiableCredentials.map((cryptkeeperVerifiableCredential) =>
    serializeCryptkeeperVC(cryptkeeperVerifiableCredential),
  );

  dispatch(setVerifiableCredentials(serializedVerifiableCredentials));
};

export const useVerifiableCredentials = (): string[] =>
  useAppSelector((state) => state.verifiableCredentials.serializedVerifiableCredentials);

export default verifiableCredentialsSlice.reducer;
