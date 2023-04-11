/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { IdentityData, useIdentities, fetchIdentities } from "@src/ui/ducks/identities";
import { checkHostApproval } from "@src/ui/ducks/permissions";
import { useWallet } from "@src/ui/hooks/wallet";
import { getLastActiveTabUrl } from "@src/util/browser";

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
  useIdentities: jest.fn(),
}));

jest.mock("@src/ui/ducks/permissions", (): unknown => ({
  checkHostApproval: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  getLastActiveTabUrl: jest.fn(),
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

  const defaultUrl = new URL("http://localhost:3000");

  beforeEach(() => {
    (getLastActiveTabUrl as jest.Mock).mockResolvedValue(defaultUrl);

    (useRef as jest.Mock).mockReturnValue({ current: null });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useIdentities as jest.Mock).mockReturnValue(defaultIdentities);

    (checkHostApproval as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useHome());

    expect(result.current.address).toBe(defaultWalletHookData.address);
    expect(result.current.balance).toStrictEqual(defaultWalletHookData.balance);
    expect(result.current.chain).toStrictEqual(defaultWalletHookData.chain);
    expect(result.current.identities).toStrictEqual(defaultIdentities);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
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
