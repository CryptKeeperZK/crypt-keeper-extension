/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import log from "loglevel";
import { useNavigate } from "react-router-dom";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { fetchStatus, getSelectedAccount, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, usePendingRequests } from "@src/ui/ducks/requests";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import { IUsePopupData, usePopup } from "../usePopup";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  fetchStatus: jest.fn(),
  getSelectedAccount: jest.fn(),
  useAppStatus: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  fetchPendingRequests: jest.fn(),
  usePendingRequests: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

describe("ui/pages/Popup/usePopup", () => {
  const defaultStatusData = {
    isInitialized: false,
    isUnlocked: false,
    isMnemonicGenerated: false,
  };

  const mockDispatch = jest.fn();

  const mockNavigate = jest.fn();

  const waitForData = async (current: IUsePopupData) => {
    await waitFor(() => current.isLoading === true);
    await waitFor(() => expect(mockDispatch).toBeCalledTimes(3));
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

    (usePendingRequests as jest.Mock).mockReturnValue([]);

    (useAppStatus as jest.Mock).mockReturnValue(defaultStatusData);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useEthWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useCryptKeeperWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
  });

  test("should get data and connect on first load", async () => {
    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(3);
    expect(fetchStatus).toBeCalledTimes(1);
    expect(fetchPendingRequests).toBeCalledTimes(1);
    expect(getSelectedAccount).toBeCalledTimes(1);
    expect(defaultWalletHookData.onConnectEagerly).toBeCalledTimes(2);
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
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isUnlocked: true, isMnemonicGenerated: true });

    const url = `${window.location.href}?redirect=${Paths.CREATE_IDENTITY}`;
    window.location.href = url;

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.CREATE_IDENTITY);

    window.location.href = oldHref;
  });

  test("should redirect to login page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isMnemonicGenerated: true, isUnlocked: false });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.LOGIN);
  });

  test("should redirect to onboarding page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({
      isInitialized: false,
      isMnemonicGenerated: false,
      isUnlocked: false,
    });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.ONBOARDING);
  });

  test("should redirect to mnemonic page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({
      isInitialized: true,
      isMnemonicGenerated: false,
      isUnlocked: true,
    });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.MNEMONIC);
  });

  test("should redirect to pending requests page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isMnemonicGenerated: true, isUnlocked: true });
    (usePendingRequests as jest.Mock).mockReturnValue([{}]);

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.REQUESTS);
  });
});
