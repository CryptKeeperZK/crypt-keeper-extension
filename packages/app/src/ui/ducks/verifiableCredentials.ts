import { RPCAction } from "@cryptkeeperzk/providers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { VerifiableCredential } from "@cryptkeeperzk/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";
import { CryptkeeperVerifiableCredential, FlattenedCryptkeeperVerifiableCredential } from "@src/types";
import { flattenCryptkeeperVerifiableCredential } from "@src/util/verifiableCredentials";

export interface VerifiableCredentialState {
  verifiableCredentials: CryptkeeperVerifiableCredential[];
}

const initialState: VerifiableCredentialState = {
  verifiableCredentials: [],
};

const verifiableCredentialsSlice = createSlice({
  name: "verifiableCredentials",
  initialState,
  reducers: {
    setVerifiableCredentials: (
      state: VerifiableCredentialState,
      action: PayloadAction<CryptkeeperVerifiableCredential[]>,
    ) => {
      state.verifiableCredentials = action.payload;
    },
  },
});

export const { setVerifiableCredentials } = verifiableCredentialsSlice.actions;

export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVerifiableCredentials = await postMessage<CryptkeeperVerifiableCredential[]>({
    method: RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  console.log("fetching vcs", cryptkeeperVerifiableCredentials);

  const flattenedVerifiableCredentials = cryptkeeperVerifiableCredentials.map((cryptkeeperVerifiableCredential) => {
    return flattenCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential);
  });

  console.log("flattened vcs", flattenedVerifiableCredentials);

  dispatch(setVerifiableCredentials(flattenedVerifiableCredentials));
};

export const useVerifiableCredentials = (): FlattenedCryptkeeperVerifiableCredential[] => {
  return useAppSelector((state) => state.verifiableCredentials.verifiableCredentials);
};

export default verifiableCredentialsSlice.reducer;
