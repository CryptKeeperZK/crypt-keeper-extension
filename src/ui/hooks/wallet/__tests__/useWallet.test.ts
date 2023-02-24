/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useWeb3React } from "@web3-react/core";

import { metamask, metamaskHooks, ConnectorNames } from "@src/connectors";
import { mockConnector } from "@src/connectors/mock";

import { useWallet } from "..";
import { defaultWalletHookData } from "@src/config/mock/wallet";

jest.mock("@web3-react/core", (): unknown => ({
  ...jest.requireActual("@web3-react/core"),
  useWeb3React: jest.fn(),
}));

jest.mock("@src/connectors", (): unknown => ({
  ...jest.requireActual("@src/connectors"),
  metamaskHooks: { useChainId: jest.fn(), useAccount: jest.fn(), useProvider: jest.fn() },
}));

describe("ui/hooks/wallet", () => {
  beforeEach(() => {
    (defaultWalletHookData.provider?.getBalance as jest.Mock).mockResolvedValue(
      defaultWalletHookData.balance?.toString(10),
    );

    (useWeb3React as jest.Mock).mockReturnValue({
      connector: metamask,
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
    });

    (metamaskHooks.useChainId as jest.Mock).mockReturnValue(1);

    (metamaskHooks.useAccount as jest.Mock).mockReturnValue(defaultWalletHookData.address);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return connected metamask data", async () => {
    const { result } = renderHook(() => useWallet());

    await waitFor(() => expect(result.current.balance).toBeDefined());

    expect(result.current.isActive).toBe(true);
    expect(result.current.chain).toStrictEqual(defaultWalletHookData.chain);
    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.connectorName).toBe(ConnectorNames.METAMASK);
    expect(result.current.connector).toBeDefined();
    expect(result.current.provider).toBeDefined();
  });

  test("should return mock connector data", () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      connector: mockConnector,
      isActive: true,
      isActivating: false,
    });

    const { result } = renderHook(() => useWallet());

    expect(result.current.isActive).toBe(true);
    expect(result.current.isActivating).toBe(false);
    expect(result.current.chain).toStrictEqual(defaultWalletHookData.chain);
    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.connectorName).toBe(ConnectorNames.MOCK);
    expect(result.current.connector).toBeDefined();
    expect(result.current.provider).toBeUndefined();
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
});
