/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useWeb3React } from "@web3-react/core";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { metamask, metamaskHooks } from "@src/connectors";
import { ConnectorNames } from "@src/types";
import { getWalletConnection, lock, setWalletConnection, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useEthWallet } from "..";

jest.mock("@web3-react/core", (): unknown => ({
  ...jest.requireActual("@web3-react/core"),
  useWeb3React: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  useAppStatus: jest.fn(),
  getWalletConnection: jest.fn(),
  setWalletConnection: jest.fn(),
  lock: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/connectors", (): unknown => ({
  ...jest.requireActual("@src/connectors"),
  metamask: {
    activate: jest.fn(),
    connectEagerly: jest.fn(),
    deactivate: jest.fn(),
    resetState: jest.fn(),
  },
  metamaskHooks: {
    useChainId: jest.fn(),
    useAccount: jest.fn(),
    useAccounts: jest.fn(),
  },
}));

describe("ui/hooks/useEthWallet", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (defaultWalletHookData.provider?.getBalance as jest.Mock).mockResolvedValue(
      defaultWalletHookData.balance?.toString(10),
    );

    (useWeb3React as jest.Mock).mockReturnValue({
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
    });

    (useAppStatus as jest.Mock).mockReturnValue({ isDisconnectedPermanently: false });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (metamaskHooks.useAccount as jest.Mock).mockReturnValue(defaultWalletHookData.address);

    (metamaskHooks.useAccounts as jest.Mock).mockReturnValue(defaultWalletHookData.addresses);

    (metamaskHooks.useChainId as jest.Mock).mockReturnValue(defaultWalletHookData.chain?.chainId);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return empty connected data", () => {
    const { result } = renderHook(() => useEthWallet(ConnectorNames.MOCK));

    expect(result.current.isActive).toBe(true);
    expect(result.current.isActivating).toBe(false);
    expect(result.current.isInjectedWallet).toBe(false);
    expect(result.current.chain).toBeUndefined();
    expect(result.current.address).toBeUndefined();
    expect(result.current.connectorName).toBe(ConnectorNames.MOCK);
    expect(result.current.connector).toBeUndefined();
    expect(result.current.provider).toBeUndefined();
  });

  test("should return connected metamask data", async () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
    });

    const { result } = renderHook(() => useEthWallet());

    await waitFor(() => expect(result.current.balance).toBeDefined());

    expect(result.current.isActive).toBe(true);
    expect(result.current.isActivating).toBe(false);
    expect(result.current.isInjectedWallet).toBe(false);
    expect(result.current.chain).toStrictEqual(defaultWalletHookData.chain);
    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.connectorName).toBe(ConnectorNames.METAMASK);
    expect(result.current.connector).toBeDefined();
    expect(result.current.provider).toBeDefined();
  });

  test("should return unknown connect data", () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      connector: undefined,
      isActive: false,
      isActivating: false,
    });

    const { result } = renderHook(() => useEthWallet("unknown" as ConnectorNames));

    expect(result.current.isActive).toBe(false);
    expect(result.current.isActivating).toBe(false);
    expect(result.current.isInjectedWallet).toBe(false);
    expect(result.current.chain).toBeUndefined();
    expect(result.current.address).toBeUndefined();
    expect(result.current.connectorName).toBe("unknown");
    expect(result.current.connector).toBeUndefined();
    expect(result.current.provider).toBeUndefined();
  });

  test("should connect properly", async () => {
    const activateSpy = jest.spyOn(metamask, "activate");
    const { result } = renderHook(() => useEthWallet());

    await act(async () => result.current.onConnect());

    expect(activateSpy).toBeCalledTimes(1);
    expect(setWalletConnection).toBeCalledTimes(1);
    expect(setWalletConnection).toBeCalledWith(false);
  });

  test("should connect eagerly properly", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isDisconnectedPermanently: false });
    const connectEagerlySpy = jest.spyOn(metamask, "connectEagerly");
    const { result } = renderHook(() => useEthWallet());

    await act(async () => result.current.onConnectEagerly());

    expect(connectEagerlySpy).toBeCalledTimes(1);
    expect(getWalletConnection).toBeCalledTimes(1);
  });

  test("should disconnect properly", async () => {
    const resetStateSpy = jest.spyOn(metamask, "resetState");
    const { result } = renderHook(() => useEthWallet());

    await act(async () => result.current.onDisconnect());

    expect(resetStateSpy).toBeCalledTimes(1);
    expect(setWalletConnection).toBeCalledTimes(1);
    expect(setWalletConnection).toBeCalledWith(true);
  });

  test("should lock properly", async () => {
    const { result } = renderHook(() => useEthWallet());

    await act(async () => Promise.resolve(result.current.onLock()));

    expect(lock).toBeCalledTimes(1);
  });
});
