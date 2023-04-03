/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { browser } from "webextension-polyfill-ts";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { RPCAction } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { IdentityData, useIdentities, fetchIdentities, deleteAllIdentities } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import postMessage from "@src/util/postMessage";

import { useHome } from "../useHome";

jest.mock("react", (): unknown => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
  deleteAllIdentities: jest.fn(),
  useIdentities: jest.fn(),
}));

describe("ui/pages/Home/useHome", () => {
  const mockDispatch = jest.fn();

  const defaultIdentities: IdentityData[] = [
    {
      commitment: "1",
      metadata: {
        account: defaultWalletHookData.address as string,
        name: "Account #1",
        identityStrategy: "interrep",
        web2Provider: "twitter",
      },
    },
    {
      commitment: "2",
      metadata: {
        account: defaultWalletHookData.address as string,
        name: "Account #2",
        identityStrategy: "random",
      },
    },
  ];

  const defaultTabs = [{ id: 1, url: "http://localhost:3000" }];

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (useRef as jest.Mock).mockReturnValue({ current: null });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useIdentities as jest.Mock).mockReturnValue(defaultIdentities);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useHome());

    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.balance).toStrictEqual(defaultWalletHookData.balance);
    expect(result.current.chain).toStrictEqual(defaultWalletHookData.chain);
    expect(result.current.isFixedTabsMode).toBe(false);
    expect(result.current.scrollRef.current).toBeNull();
    expect(result.current.identities).toStrictEqual(defaultIdentities);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should refresh connection status properly", async () => {
    const { result } = renderHook(() => useHome());

    await act(async () => result.current.refreshConnectionStatus());

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.IS_HOST_APPROVED,
      payload: defaultTabs[0].url,
    });
  });

  test("should not refresh connection status if there is no any tab", async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useHome());

    await act(async () => result.current.refreshConnectionStatus());

    expect(postMessage).not.toBeCalled();
  });

  test("should delete all identities properly", async () => {
    const { result } = renderHook(() => useHome());

    await act(async () => Promise.resolve(result.current.onDeleteAllIdentities()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(deleteAllIdentities).toBeCalledTimes(1);
  });

  test("should set fixed tabs mode properly", async () => {
    (useRef as jest.Mock).mockReturnValue({ current: { scrollTop: 100 } });

    const { result } = renderHook(() => useHome());

    await act(async () => Promise.resolve(result.current.onScroll()));

    expect(result.current.isFixedTabsMode).toBe(true);
  });

  test("should not set fixed tabs mode if there is no ref", async () => {
    const { result } = renderHook(() => useHome());

    await act(async () => Promise.resolve(result.current.onScroll()));

    expect(result.current.isFixedTabsMode).toBe(false);
  });
});
