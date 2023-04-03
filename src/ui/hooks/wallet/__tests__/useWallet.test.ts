/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useWeb3React } from "@web3-react/core";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { ConnectorNames, metamask } from "@src/connectors";
import { mockConnector } from "@src/connectors/mock";
import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import { useWallet } from "..";

jest.mock("@web3-react/core", (): unknown => ({
  ...jest.requireActual("@web3-react/core"),
  useWeb3React: jest.fn(),
}));

describe("ui/hooks/wallet", () => {
  const defaultHooks = { usePriorityChainId: jest.fn(), usePriorityAccount: jest.fn(), usePriorityProvider: jest.fn() };

  beforeEach(() => {
    (defaultWalletHookData.provider?.getBalance as jest.Mock).mockResolvedValue(
      defaultWalletHookData.balance?.toString(10),
    );

    (useWeb3React as jest.Mock).mockReturnValue({
      connector: mockConnector,
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
      hooks: defaultHooks,
    });

    defaultHooks.usePriorityChainId.mockReturnValue(1);

    defaultHooks.usePriorityAccount.mockReturnValue(defaultWalletHookData.address);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return connected data", async () => {
    const { result } = renderHook(() => useWallet());

    await waitFor(() => expect(result.current.balance).toBeDefined());

    expect(result.current.isActive).toBe(true);
    expect(result.current.chain).toStrictEqual(defaultWalletHookData.chain);
    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.connectorName).toBe(ConnectorNames.MOCK);
    expect(result.current.connector).toBeDefined();
    expect(result.current.provider).toBeDefined();
  });

  test("should return connected metamask data", async () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      connector: metamask,
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
      hooks: defaultHooks,
    });

    const { result } = renderHook(() => useWallet());

    await waitFor(() => expect(result.current.balance).toBeDefined());

    expect(result.current.isActive).toBe(true);
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

    const { result } = renderHook(() => useWallet());

    expect(result.current.isActive).toBe(false);
    expect(result.current.isActivating).toBe(false);
    expect(result.current.chain).toBeUndefined();
    expect(result.current.address).toBeUndefined();
    expect(result.current.connectorName).toBe(ConnectorNames.UNKNOWN);
    expect(result.current.connector).toBeUndefined();
    expect(result.current.provider).toBeUndefined();
  });

  test("should connect properly", async () => {
    const activateSpy = jest.spyOn(mockConnector, "activate");
    const { result } = renderHook(() => useWallet());

    await act(async () => result.current.onConnect());

    expect(activateSpy).toBeCalledTimes(1);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.SET_CONNECT_WALLET,
      payload: { isDisconnectedPermanently: false },
    });
  });

  test("should connect eagerly properly", async () => {
    const connectEagerlySpy = jest.spyOn(mockConnector, "connectEagerly");
    (postMessage as jest.Mock).mockReturnValue({ isDisconnectedPermanently: false });
    const { result } = renderHook(() => useWallet());

    await act(async () => result.current.onConnectEagerly());

    expect(connectEagerlySpy).toBeCalledTimes(1);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.GET_CONNECT_WALLET });
  });

  test("should disconnect properly", async () => {
    const resetStateSpy = jest.spyOn(mockConnector, "resetState");
    const { result } = renderHook(() => useWallet());

    await act(async () => result.current.onDisconnect());

    expect(resetStateSpy).toBeCalledTimes(1);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.SET_CONNECT_WALLET,
      payload: { isDisconnectedPermanently: true },
    });
  });

  test("should lock properly", async () => {
    const { result } = renderHook(() => useWallet());

    await act(async () => result.current.onLock());

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.LOCK,
    });
  });
});
