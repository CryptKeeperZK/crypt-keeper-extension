import { AnyAction, configureStore, ThunkDispatch, ThunkAction } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import { isDebugMode } from "@src/config/env";
import app from "@src/ui/ducks/app";
import identities from "@src/ui/ducks/identities";
import permissions from "@src/ui/ducks/permissions";
import requests from "@src/ui/ducks/requests";
import verifiableCredentials from "@src/ui/ducks/verifiableCredentials";

const rootReducer = {
  identities,
  requests,
  app,
  permissions,
  verifiableCredentials,
};

const middlewares = isDebugMode() ? [thunk, createLogger({ collapsed: true })] : [thunk];

function configureAppStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...middlewares),
    devTools: isDebugMode(),
  });
}

export const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type TypedDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export type TypedThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, AnyAction>;
