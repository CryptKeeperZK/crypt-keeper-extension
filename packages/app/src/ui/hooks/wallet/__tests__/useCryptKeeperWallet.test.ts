/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useWeb3React } from "@web3-react/core";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { cryptKeeper, cryptKeeperHooks } from "@src/connectors";
import { ConnectorNames } from "@src/types";
import { lock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useCryptKeeperWallet } from "..";

jest.mock("@web3-react/core", (): unknown => ({
  ...jest.requireActual("@web3-react/core"),
  useWeb3React: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  lock: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/connectors", (): unknown => ({
  ...jest.requireActual("@src/connectors"),
  cryptKeeper: {
    activate: jest.fn(),
    connectEagerly: jest.fn(),
    deactivate: jest.fn(),
    resetState: jest.fn(),
  },
  cryptKeeperHooks: {
    useChainId: jest.fn(),
    useAccount: jest.fn(),
    useAccounts: jest.fn(),
  },
}));

describe("ui/hooks/useCryptKeeperWallet", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useWeb3React as jest.Mock).mockReturnValue({
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
    });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (cryptKeeperHooks.useAccount as jest.Mock).mockReturnValue(defaultWalletHookData.address);

    (cryptKeeperHooks.useAccounts as jest.Mock).mockReturnValue(defaultWalletHookData.addresses);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return connected wallet data", () => {
    (useWeb3React as jest.Mock).mockReturnValue({
      provider: defaultWalletHookData.provider,
      isActive: true,
      isActivating: false,
    });

    const { result } = renderHook(() => useCryptKeeperWallet());

    expect(result.current.isActive).toBe(true);
    expect(result.current.isActivating).toBe(false);
    expect(result.current.isInjectedWallet).toBe(false);
    expect(result.current.chain).toBeUndefined();
    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.connectorName).toBe(ConnectorNames.CRYPTKEEPER);
    expect(result.current.connector).toBeDefined();
    expect(result.current.provider).toBeUndefined();
  });

  test("should connect properly", async () => {
    const activateSpy = jest.spyOn(cryptKeeper, "activate");
    const { result } = renderHook(() => useCryptKeeperWallet());

    await act(async () => result.current.onConnect());

    expect(activateSpy).toBeCalledTimes(1);
  });

  test("should connect eagerly properly", async () => {
    const connectEagerlySpy = jest.spyOn(cryptKeeper, "connectEagerly");
    const { result } = renderHook(() => useCryptKeeperWallet());

    await act(async () => result.current.onConnectEagerly());

    expect(connectEagerlySpy).toBeCalledTimes(1);
  });

  test("should disconnect properly", async () => {
    const resetStateSpy = jest.spyOn(cryptKeeper, "resetState");
    const { result } = renderHook(() => useCryptKeeperWallet());

    await act(async () => result.current.onDisconnect());

    expect(resetStateSpy).toBeCalledTimes(1);
  });

  test("should lock properly", async () => {
    const { result } = renderHook(() => useCryptKeeperWallet());

    await act(async () => Promise.resolve(result.current.onLock()));

    expect(lock).toBeCalledTimes(1);
  });
});
