import { RPCAction } from "@cryptkeeperzk/providers";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { VerifiableCredential } from "@cryptkeeperzk/types";
import postMessage from "@src/util/postMessage";

import type { TypedThunk } from "@src/ui/store/configureAppStore";

import { useAppSelector } from "./hooks";
import { CryptkeeperVerifiableCredential, FlattenedCryptkeeperVerifiableCredential } from "@src/types";
import { flattenCryptkeeperVerifiableCredential } from "@src/util/verifiableCredentials";
import { serializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";

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

export const fetchVerifiableCredentials = (): TypedThunk => async (dispatch) => {
  const cryptkeeperVerifiableCredentials = await postMessage<CryptkeeperVerifiableCredential[]>({
    method: RPCAction.GET_ALL_VERIFIABLE_CREDENTIALS,
  });

  console.log("fetching vcs", cryptkeeperVerifiableCredentials);

  const serializedVerifiableCredentials = cryptkeeperVerifiableCredentials.map((cryptkeeperVerifiableCredential) => {
    return serializeCryptkeeperVerifiableCredential(cryptkeeperVerifiableCredential);
  });

  console.log("serialized vcs", serializedVerifiableCredentials);

  dispatch(setVerifiableCredentials(serializedVerifiableCredentials));
};

export const useVerifiableCredentials = (): string[] => {
  return useAppSelector((state) => state.verifiableCredentials.verifiableCredentials);
};

export default verifiableCredentialsSlice.reducer;
