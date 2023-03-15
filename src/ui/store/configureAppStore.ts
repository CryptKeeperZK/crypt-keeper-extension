import { AnyAction, applyMiddleware, combineReducers, createStore } from "redux";
import { createLogger } from "redux-logger";
import thunk, { ThunkDispatch } from "redux-thunk";
import identities from "@src/ui/ducks/identities";
import requests from "@src/ui/ducks/requests";
import app from "@src/ui/ducks/app";
import wallets from "@src/ui/ducks/wallet";
import approves from "@src/ui/ducks/approves";
import injections from "../ducks/injections";
import { isDebugMode } from "@src/config/env";

const rootReducer = combineReducers({
  identities,
  requests,
  app,
  approves,
  wallets,
  injections
});

export type AppRootState = ReturnType<typeof rootReducer>;

function configureAppStore() {
  return createStore(
    rootReducer,
    isDebugMode()
      ? applyMiddleware(
          thunk,
          createLogger({
            collapsed: (getState, action = {}) => [""].includes(action.type),
          }),
        )
      : applyMiddleware(thunk),
  );
}

export const store = configureAppStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export type ReduxState = ReturnType<typeof rootReducer>;

export type TypedDispatch = ThunkDispatch<ReadyState, any, AnyAction>;
