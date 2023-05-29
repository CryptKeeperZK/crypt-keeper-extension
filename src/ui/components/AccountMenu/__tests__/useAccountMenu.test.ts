/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { MouseEvent as ReactMouseEvent } from "react";
import { useNavigate } from "react-router-dom";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { EWallet } from "@src/types";
import { getExtensionUrl, redirectToNewTab } from "@src/util/browser";

import { IUseAccountMenuArgs, useAccountMenu } from "../useAccountMenu";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
  getExtensionUrl: jest.fn(),
}));

describe("ui/components/AccountMenu/useAccountMenu", () => {
  const mockNavigate = jest.fn();

  const defaultArgs: IUseAccountMenuArgs = {
    ethWallet: defaultWalletHookData,
    cryptKeeperWallet: defaultWalletHookData,
  };

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (getExtensionUrl as jest.Mock).mockReturnValue("options.html");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    expect(result.current.accounts).toStrictEqual([
      { type: EWallet.ETH_WALLET, address: defaultWalletHookData.address, active: true },
      { type: EWallet.CRYPT_KEEPER_WALLET, address: defaultWalletHookData.address, active: true },
    ]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.anchorEl).toBeUndefined();
  });

  test("should return empty addresses", () => {
    const { result } = renderHook(() =>
      useAccountMenu({
        ethWallet: { ...defaultWalletHookData, addresses: undefined },
        cryptKeeperWallet: { ...defaultWalletHookData, addresses: undefined },
      }),
    );

    expect(result.current.accounts).toStrictEqual([]);
  });

  test("should go to install metamask", async () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    await act(() => Promise.resolve(result.current.onGoToMetamaskPage()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith("https://metamask.io/");
  });

  test("should go to settings page", async () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    await act(async () => Promise.resolve(result.current.onGoToSettings()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.SETTINGS);
  });

  test("should open and close menu properly", async () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    await act(async () =>
      Promise.resolve(result.current.onOpen({ currentTarget: {} } as unknown as ReactMouseEvent<HTMLButtonElement>)),
    );
    await waitFor(() => result.current.anchorEl !== undefined);

    expect(result.current.isOpen).toBe(true);
    expect(result.current.anchorEl).toBeDefined();

    await act(async () => Promise.resolve(result.current.onClose()));
    await waitFor(() => !result.current.anchorEl);

    expect(result.current.isOpen).toBe(false);
    expect(result.current.anchorEl).toBeUndefined();
  });

  test("should lock properly", async () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    await act(async () => Promise.resolve(result.current.onLock()));

    expect(defaultWalletHookData.onLock).toBeCalledTimes(1);
  });

  test("should connect properly", async () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    await act(async () => Promise.resolve(result.current.onConnect()));

    expect(defaultWalletHookData.onConnect).toBeCalledTimes(1);
  });

  test("should disconnect properly", async () => {
    const { result } = renderHook(() => useAccountMenu(defaultArgs));

    await act(async () => Promise.resolve(result.current.onDisconnect()));

    expect(defaultWalletHookData.onDisconnect).toBeCalledTimes(1);
  });
});
