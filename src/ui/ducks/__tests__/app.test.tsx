/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { RPCAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  closePopup,
  fetchStatus,
  getWalletConnection,
  lock,
  saveMnemonic,
  setStatus,
  setWalletConnection,
  setupPassword,
  unlock,
  useAppStatus,
} from "../app";

jest.mock("redux-logger", (): unknown => ({
  createLogger: () => () => (action: unknown) => action,
}));

jest.mock("@src/config/env", (): unknown => ({
  isDebugMode: () => true,
}));

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/app", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch status properly", async () => {
    const expectedState = {
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: undefined,
    };
    (postMessage as jest.Mock).mockResolvedValue(expectedState);

    await Promise.resolve(store.dispatch(fetchStatus()));
    const { app } = store.getState();
    const { result } = renderHook(() => useAppStatus(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(app).toStrictEqual(expectedState);
    expect(result.current).toStrictEqual(expectedState);
  });

  test("should set status properly", async () => {
    const expectedState = {
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: undefined,
    };

    await Promise.resolve(store.dispatch(setStatus(expectedState)));
    const { app } = store.getState();

    expect(app).toStrictEqual(expectedState);
  });

  test("should set wallet connection properly", async () => {
    const expectedState = {
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: true,
    };

    await Promise.resolve(store.dispatch(setWalletConnection(true)));
    const { app } = store.getState();

    expect(app).toStrictEqual(expectedState);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.SET_CONNECT_WALLET,
      payload: { isDisconnectedPermanently: true },
    });
  });

  test("should get wallet connection properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue({ isDisconnectedPermanently: true });

    const expectedState = {
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: true,
    };

    await Promise.resolve(store.dispatch(getWalletConnection()));
    const { app } = store.getState();

    expect(app).toStrictEqual(expectedState);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.GET_CONNECT_WALLET,
    });
  });

  test("should call close popup action properly", async () => {
    await Promise.resolve(store.dispatch(closePopup()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.CLOSE_POPUP });
  });

  test("should call lock action properly", async () => {
    await Promise.resolve(store.dispatch(lock()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.LOCK });
  });

  test("should call unlock action properly", async () => {
    await Promise.resolve(store.dispatch(unlock("password")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.UNLOCK, payload: "password" });
  });

  test("should call setup password action properly", async () => {
    await Promise.resolve(store.dispatch(setupPassword("password")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.SETUP_PASSWORD, payload: "password" });
  });

  test("should call save mnemonic action properly", async () => {
    await Promise.resolve(store.dispatch(saveMnemonic("mnemonic")));
    const { app } = store.getState();

    expect(app).toStrictEqual({
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: true,
    });
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.SAVE_MNEMONIC, payload: "mnemonic" });
  });
});
