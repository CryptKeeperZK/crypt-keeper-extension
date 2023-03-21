/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import log from "loglevel";
import { useNavigate } from "react-router-dom";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { fetchStatus, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchRequestPendingStatus, useRequestsPending } from "@src/ui/ducks/requests";
import { useWallet } from "@src/ui/hooks/wallet";

import { IUsePopupData, usePopup } from "../usePopup";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  fetchStatus: jest.fn(),
  useAppStatus: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  fetchRequestPendingStatus: jest.fn(),
  useRequestsPending: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/pages/Popup/usePopup", () => {
  const defaultStatusData = {
    initialized: false,
    unlocked: false,
  };

  const mockDispatch = jest.fn();

  const mockNavigate = jest.fn();

  const waitForData = async (current: IUsePopupData) => {
    await waitFor(() => current.isLoading === true);
    await waitFor(() => current.isLoading === false);
  };

  const oldHref = window.location.href;

  Object.defineProperty(window, "location", {
    value: {
      href: oldHref,
    },
    writable: true,
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useRequestsPending as jest.Mock).mockReturnValue([]);

    (useAppStatus as jest.Mock).mockReturnValue(defaultStatusData);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.initialized).toBe(false);
    expect(result.current.unlocked).toBe(false);
    expect(result.current.pendingRequests).toHaveLength(0);
  });

  test("should get data and connect on first load", async () => {
    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchStatus).toBeCalledTimes(1);
    expect(fetchRequestPendingStatus).toBeCalledTimes(1);
    expect(defaultWalletHookData.onConnectEagerly).toBeCalledTimes(1);
  });

  test("should handle load data error", async () => {
    const err = new Error("error");
    mockDispatch.mockRejectedValue(err);

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(log.error).toBeCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(log.error).toBeCalledWith(err);
  });

  test("should redirect to create identity page", async () => {
    const url = `${window.location.href}?redirect=${Paths.CREATE_IDENTITY}`;
    window.location.href = url;

    const spyReplaceState = jest.spyOn(window.history, "replaceState");

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.CREATE_IDENTITY);
    expect(spyReplaceState).toBeCalledTimes(1);

    window.location.href = oldHref;
  });
});
