/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { RPCAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import { closePopup, fetchStatus, setStatus, setupPassword, unlock, useAppStatus } from "../app";

jest.mock("redux-logger", (): unknown => ({
  createLogger: () => () => (action: unknown) => action,
}));

jest.mock("@src/config/env", (): unknown => ({
  isDebugMode: () => true,
}));

describe("ui/ducks/app", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch status properly", async () => {
    const expectedState = { initialized: true, unlocked: true };
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
    const expectedState = { initialized: true, unlocked: true };

    await Promise.resolve(store.dispatch(setStatus(expectedState)));
    const { app } = store.getState();

    expect(app).toStrictEqual(expectedState);
  });

  test("should call close popup action properly", async () => {
    await Promise.resolve(store.dispatch(closePopup()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.CLOSE_POPUP });
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
});
