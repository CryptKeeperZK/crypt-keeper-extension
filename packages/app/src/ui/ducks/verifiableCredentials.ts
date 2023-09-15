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

/**
 * Adds a verifiable credential to wallet.
 * @param serializedVerifiableCredential - The serialized Verifiable Credential to add.
 * @param verifiableCredentialName - User defined name for the Verifiable Credential.
 */
export const addVerifiableCredential =
  (serializedVerifiableCredential: string, verifiableCredentialName: string) => async (): Promise<void> =>
    postMessage({
      method: RPCAction.ADD_VERIFIABLE_CREDENTIAL,
      payload: {
        serializedVerifiableCredential,
        verifiableCredentialName,
      },
    });

/**
 * Rejects a request to add a Verifiable Credential. Notifies the user about rejection.
 */
export const rejectVerifiableCredentialRequest = () => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.REJECT_VERIFIABLE_CREDENTIAL_REQUEST,
  });
};

/**
 * Renames a Verifiable Credential in the wallet.
 * @param renameVCArgs - The arguments for renaming a Verifiable Credential.
 * @param renameVCArgs.verifiableCredentialHash - The hash of the Verifiable Credential to rename.
 * @param renameVCArgs.newVerifiableCredentialName - The new name for the Verifiable Credential.
 */
export const renameVerifiableCredential = (renameVCArgs: IRenameVCArgs) => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.RENAME_VERIFIABLE_CREDENTIAL,
    payload: renameVCArgs,
  });
};

/**
 * Deletes a Verifiable Credential from the wallet.
 * @param vcHash - The hash of the Verifiable Credential to delete.
 */
export const deleteVerifiableCredential = (vcHash: string) => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.DELETE_VERIFIABLE_CREDENTIAL,
    payload: vcHash,
  });
};

/**
 * Submits a Verifiable Presentation to the background service for event propagation.
 * @param verifiablePresentation - The Verifiable Presentation to submit.
 */
export const submitVerifiablePresentation =
  (verifiablePresentation: IVerifiablePresentation) => async (): Promise<void> => {
    await postMessage({
      method: RPCAction.ANNOUNCE_VERIFIABLE_PRESENTATION,
      payload: verifiablePresentation,
    });
  };

/**
 * Submits a Verifiable Presentation to the background service for signing and event propagation.
 * @param signVPArgs - The arguments for signing a Verifiable Presentation.
 * @param signVPArgs.verifiablePresentation - The Verifiable Presentation to sign.
 * @param signVPArgs.address - The address of the key to sign the Verifiable Presentation with.
 */
export const signAndSubmitVerifiablePresentation = (signVPArgs: ISignVPArgs) => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.SIGN_AND_ANNOUNCE_VERIFIABLE_PRESENTATION,
    payload: signVPArgs,
  });
};

/**
 * Rejects a request to sign a Verifiable Presentation. Notifies the user about rejection.
 */
export const rejectVerifiablePresentationRequest = () => async (): Promise<void> => {
  await postMessage({
    method: RPCAction.REJECT_VERIFIABLE_PRESENTATION_REQUEST,
  });
};

/**
 * Fetches all Verifiable Credentials from the wallet. Serializes them and stores them in the store.
 */
export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVerifiableCredentials = await postMessage<ICryptkeeperVerifiableCredential[]>({
    method: RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  const serializedVerifiableCredentials = cryptkeeperVerifiableCredentials.map((cryptkeeperVerifiableCredential) =>
    serializeCryptkeeperVC(cryptkeeperVerifiableCredential),
  );

  dispatch(setVerifiableCredentials(serializedVerifiableCredentials));
};

/**
 * Hook to get serialized Verifiable Credentials from the store.
 */
export const useVerifiableCredentials = (): string[] =>
  useAppSelector((state) => state.verifiableCredentials.serializedVerifiableCredentials);

export default verifiableCredentialsSlice.reducer;
