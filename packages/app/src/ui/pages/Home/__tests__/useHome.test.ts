/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IdentityData } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useIdentities, fetchIdentities, fetchHistory, useConnectedIdentity } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { fetchVerifiableCredentials, useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";
import { useEthWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

import { useHome } from "../useHome";

jest.mock("react", (): unknown => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
  fetchHistory: jest.fn(),
  useIdentities: jest.fn(),
  useConnectedIdentity: jest.fn(),
}));

jest.mock("@src/ui/ducks/permissions", (): unknown => ({
  checkHostApproval: jest.fn(),
}));

describe("ui/pages/Home/useHome", () => {
  const mockDispatch = jest.fn();

  const defaultIdentities: IdentityData[] = [
    {
      commitment: "1",
      metadata: {
        account: defaultWalletHookData.address!,
        name: "Account #1",
        identityStrategy: "interrep",
        web2Provider: "twitter",
        groups: [],
        host: "http://localhost:3000",
      },
    },
    {
      commitment: "2",
      metadata: {
        account: defaultWalletHookData.address!,
        name: "Account #2",
        identityStrategy: "random",
        groups: [],
        host: "http://localhost:3000",
      },
    },
  ];

  const defaultCredentials: string[] = ["mock-serialized-credential-1, mock-serialized-credential-2"];

  const defaultUrl = new URL("http://localhost:3000");

  beforeEach(() => {
    (getLastActiveTabUrl as jest.Mock).mockResolvedValue(defaultUrl);

    (useRef as jest.Mock).mockReturnValue({ current: null });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useEthWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useIdentities as jest.Mock).mockReturnValue(defaultIdentities);

    (useConnectedIdentity as jest.Mock).mockReturnValue(defaultIdentities[0]);

    (checkHostApproval as jest.Mock).mockReturnValue(true);

    (useVerifiableCredentials as jest.Mock).mockReturnValue(defaultCredentials);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useHome());

    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.identities).toStrictEqual(defaultIdentities);
    expect(result.current.serializedVerifiableCredentials).toStrictEqual(defaultCredentials);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(fetchVerifiableCredentials).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(3);
  });

  test("should refresh connection status properly", async () => {
    const { result } = renderHook(() => useHome());

    await act(async () => result.current.refreshConnectionStatus());

    expect(checkHostApproval).toBeCalledTimes(1);
    expect(checkHostApproval).toBeCalledWith(defaultUrl.origin);
  });

  test("should not refresh connection status if there is no any tab", async () => {
    (getLastActiveTabUrl as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useHome());

    await act(async () => result.current.refreshConnectionStatus());

    expect(checkHostApproval).not.toBeCalled();
  });
});
