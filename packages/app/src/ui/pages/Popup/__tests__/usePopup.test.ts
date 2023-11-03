/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import log from "loglevel";
import { useLocation, useNavigate } from "react-router-dom";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { fetchStatus, getSelectedAccount, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, usePendingRequests } from "@src/ui/ducks/requests";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import { IUsePopupData, usePopup } from "../usePopup";

jest.mock("react-router-dom", (): unknown => ({
  useLocation: jest.fn(),
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

  const mockDispatch = jest.fn(() => Promise.resolve());

  const mockNavigate = jest.fn();

  const waitForData = async (current: IUsePopupData) => {
    await waitFor(() => current.isLoading);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(current.isUnlocked && current.isMnemonicGenerated ? 3 : 2);
    });
    await waitFor(() => !current.isLoading);
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

    (useLocation as jest.Mock).mockReturnValue({ pathname: "/" });

    (usePendingRequests as jest.Mock).mockReturnValue([]);

    (useAppStatus as jest.Mock).mockReturnValue(defaultStatusData);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useEthWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useCryptKeeperWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();

    window.location.href = oldHref;
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isUnlocked).toBe(false);
    expect(result.current.isMnemonicGenerated).toBe(false);
  });

  test("should get data and connect on first load", async () => {
    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(fetchPendingRequests).toHaveBeenCalledTimes(1);
    expect(defaultWalletHookData.onConnectEagerly).toHaveBeenCalledTimes(2);
  });

  test("should get selected account properly when mnemonic generated", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isUnlocked: true, isMnemonicGenerated: true });

    const { result } = renderHook(() => usePopup());

    await waitFor(() => result.current.isLoading);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(fetchPendingRequests).toHaveBeenCalledTimes(1);
    expect(getSelectedAccount).toHaveBeenCalledTimes(1);
  });

  test("should get selected account properly when mnemonic generated", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isUnlocked: true, isMnemonicGenerated: true });

    const { result } = renderHook(() => usePopup());

    await waitFor(() => result.current.isLoading);
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(3);
    });
    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(fetchPendingRequests).toHaveBeenCalledTimes(1);
    expect(getSelectedAccount).toHaveBeenCalledTimes(1);
  });

  test("should handle load data error", async () => {
    const err = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(err)));

    const { result } = renderHook(() => usePopup());
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(0);
      expect(result.current.isLoading).toBe(false);
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(log.error).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(log.error).toHaveBeenCalledWith(err);
  });

  test("should redirect to create identity page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isUnlocked: true, isMnemonicGenerated: true });

    const url = `${window.location.href}?redirect=${Paths.CREATE_IDENTITY}&urlOrigin=http://localhost:3000`;
    window.location.href = url;

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isUnlocked).toBe(true);
    expect(result.current.isMnemonicGenerated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      `${Paths.CREATE_IDENTITY}?urlOrigin=${encodeURIComponent("http://localhost:3000")}`,
    );
  });

  test("should redirect to login page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isMnemonicGenerated: true, isUnlocked: false });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.LOGIN);
  });

  test("should bypass redirection if location is referenced to common path", async () => {
    (useLocation as jest.Mock).mockReturnValue({ pathname: Paths.RECOVER });
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isMnemonicGenerated: true, isUnlocked: false });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  test("should redirect to onboarding page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({
      isInitialized: false,
      isMnemonicGenerated: false,
      isUnlocked: false,
    });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.ONBOARDING);
  });

  test("should redirect to mnemonic page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({
      isInitialized: true,
      isMnemonicGenerated: false,
      isUnlocked: true,
    });

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.GENERATE_MNEMONIC);
  });

  test("should redirect to pending requests page", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isInitialized: true, isMnemonicGenerated: true, isUnlocked: true });
    (usePendingRequests as jest.Mock).mockReturnValue([{}]);

    const { result } = renderHook(() => usePopup());
    await waitForData(result.current);

    expect(result.current.isUnlocked).toBe(true);
    expect(result.current.isMnemonicGenerated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.REQUESTS);
  });
});
