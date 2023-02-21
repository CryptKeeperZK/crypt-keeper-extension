import { AnyAction, applyMiddleware, combineReducers, createStore } from "redux";
import { createLogger } from "redux-logger";
import thunk, { ThunkAction, ThunkDispatch } from "redux-thunk";
import web3 from "@src/ui/ducks/web3";
import identities from "@src/ui/ducks/identities";
import requests from "@src/ui/ducks/requests";
import app from "@src/ui/ducks/app";

const rootReducer = combineReducers({
  web3,
  identities,
  requests,
  app,
});

export type AppRootState = ReturnType<typeof rootReducer>;

function configureAppStore() {
  return createStore(
    rootReducer,
    globalThis.CRYPTKEEPER_UI_DEBUG
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

export type TypedThunk<ReturnType = void> = ThunkAction<ReturnType, ReduxState, unknown, AnyAction>;
