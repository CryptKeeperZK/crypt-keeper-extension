import { RPCAction } from "@cryptkeeperzk/providers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { VerifiableCredential } from "@cryptkeeperzk/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";

export interface VerifiableCredentialState {
  verifiableCredentials: VerifiableCredential[];
}

const initialState: VerifiableCredentialState = {
  verifiableCredentials: [],
};

const verifiableCredentialsSlice = createSlice({
  name: "verifiableCredentials",
  initialState,
  reducers: {
    setVerifiableCredentials: (state: VerifiableCredentialState, action: PayloadAction<VerifiableCredential[]>) => {
      state.verifiableCredentials = action.payload;
    },
  },
});

export const { setVerifiableCredentials } = verifiableCredentialsSlice.actions;

export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const verifiableCredentials = await postMessage<VerifiableCredential[]>({
    method: RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  dispatch(setVerifiableCredentials(verifiableCredentials));
};

export const useVerifiableCredentials = (): VerifiableCredential[] => {
  return useAppSelector((state) => state.verifiableCredentials.verifiableCredentials);
};

export default verifiableCredentialsSlice.reducer;
