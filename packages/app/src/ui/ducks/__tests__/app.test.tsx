/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeperzk/providers";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { ZERO_ADDRESS } from "@src/config/const";
import { defaultMnemonic } from "@src/config/mock/wallet";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  closePopup,
  fetchStatus,
  generateMnemonic,
  getSelectedAccount,
  getWalletConnection,
  lock,
  saveMnemonic,
  selectAccount,
  setStatus,
  setWalletConnection,
  setupPassword,
  unlock,
  checkMnemonic,
  useAppStatus,
  useGeneratedMnemonic,
  resetPassword,
  getMnemonic,
  checkPassword,
  deleteStorage,
} from "../app";

jest.mock("redux-logger", (): unknown => ({
  createLogger: () => () => (action: unknown) => action,
}));

jest.mock("@src/config/env", (): unknown => ({
  ...jest.requireActual("@src/config/env"),
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
    };
    (postMessage as jest.Mock).mockResolvedValue(expectedState);

    await Promise.resolve(store.dispatch(fetchStatus()));
    const { app } = store.getState();
    const { result } = renderHook(() => useAppStatus(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(app.isInitialized).toStrictEqual(expectedState.isInitialized);
    expect(app.isUnlocked).toStrictEqual(expectedState.isUnlocked);
    expect(app.isMnemonicGenerated).toStrictEqual(expectedState.isMnemonicGenerated);
    expect(result.current.isInitialized).toStrictEqual(expectedState.isInitialized);
    expect(result.current.isUnlocked).toStrictEqual(expectedState.isUnlocked);
    expect(result.current.isMnemonicGenerated).toStrictEqual(expectedState.isMnemonicGenerated);
  });

  test("should set status properly", async () => {
    const expectedState = {
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: undefined,
      mnemonic: undefined,
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
      mnemonic: undefined,
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
      mnemonic: undefined,
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

  test("should call storage clear action properly", async () => {
    await Promise.resolve(store.dispatch(deleteStorage()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.CLEAR_STORAGE });
  });

  test("should call setup password action properly", async () => {
    await Promise.resolve(store.dispatch(setupPassword("password")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.SETUP_PASSWORD, payload: "password" });
  });

  test("should call reset password action properly", async () => {
    await Promise.resolve(store.dispatch(resetPassword({ password: "password", mnemonic: defaultMnemonic })));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.RESET_PASSWORD,
      payload: { password: "password", mnemonic: defaultMnemonic },
    });
  });

  test("should call save mnemonic action properly", async () => {
    await Promise.resolve(store.dispatch(saveMnemonic()));
    const { app } = store.getState();

    expect(app).toStrictEqual({
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: true,
      mnemonic: "",
    });
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.SAVE_MNEMONIC });
  });

  test("should select account properly", async () => {
    await Promise.resolve(store.dispatch(selectAccount(ZERO_ADDRESS)));
    const { app } = store.getState();

    expect(app).toStrictEqual({
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: true,
      mnemonic: "",
      selectedAccount: ZERO_ADDRESS,
    });

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.SELECT_ACCOUNT, payload: ZERO_ADDRESS });
  });

  test("should get selected account properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(ZERO_ADDRESS);

    await Promise.resolve(store.dispatch(getSelectedAccount()));
    const { app } = store.getState();

    expect(app).toStrictEqual({
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      isDisconnectedPermanently: true,
      mnemonic: "",
      selectedAccount: ZERO_ADDRESS,
    });

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.GET_SELECTED_ACCOUNT });
  });

  test("should generate mnemonic properly", async () => {
    const expectedState = {
      isInitialized: true,
      isUnlocked: true,
      isMnemonicGenerated: true,
      mnemonic: "mnemonic",
      isDisconnectedPermanently: undefined,
    };
    (postMessage as jest.Mock).mockResolvedValue(expectedState.mnemonic);

    await Promise.resolve(store.dispatch(generateMnemonic()));
    const { app } = store.getState();
    const { result } = renderHook(() => useGeneratedMnemonic(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(app.mnemonic).toStrictEqual(expectedState.mnemonic);
    expect(result.current).toStrictEqual(expectedState.mnemonic);
  });

  test("should check mnemonic properly", async () => {
    await Promise.resolve(store.dispatch(checkMnemonic(defaultMnemonic)));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.CHECK_MNEMONIC,
      payload: { mnemonic: defaultMnemonic, strict: true },
    });
  });

  test("should get mnemonic properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultMnemonic);

    const mnemonic = await Promise.resolve(store.dispatch(getMnemonic()));

    expect(mnemonic).toBe(defaultMnemonic);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.GET_MNEMONIC,
    });
  });

  test("should check password properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(true);

    const result = await Promise.resolve(store.dispatch(checkPassword("password")));

    expect(result).toBe(true);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.CHECK_PASSWORD,
      payload: {
        password: "password",
      },
    });
  });
});
