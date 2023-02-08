/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useIdentityFactory } from "@src/ui/services/useIdentityFactory";
import { useMetaMaskWalletInfo } from "@src/ui/services/useMetaMask";

import { IUseCreateIdentityModalArgs, useCreateIdentityModal } from "../useCreateIdentityModal";
import { WalletInfoBackground } from "@src/types";
import { ChangeEvent } from "react";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/services/useIdentityFactory", (): unknown => ({
  useIdentityFactory: jest.fn(),
}));

jest.mock("@src/ui/services/useMetaMask", (): unknown => ({
  useMetaMaskWalletInfo: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  createIdentity: jest.fn(),
}));

describe("ui/components/CreateIdentityModal/useCreateIdentityModal", () => {
  const defaultHookProps: IUseCreateIdentityModalArgs = {
    onClose: jest.fn(),
  };

  const mockWalletInfo: WalletInfoBackground = {
    account: "0x",
    balance: 0,
    networkName: "mainnet",
    chainId: 1,
    signer: {} as unknown as WalletInfoBackground["signer"],
  };

  const mockSignedMessage = "signed-message";

  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useMetaMaskWalletInfo as jest.Mock).mockReturnValue(mockWalletInfo);

    (useIdentityFactory as jest.Mock).mockReturnValue(mockSignedMessage);

    (createIdentity as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useCreateIdentityModal(defaultHookProps));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.identityStrategyType).toBe("interrep");
    expect(result.current.web2Provider).toBe("twitter");
    expect(result.current.nonce).toBe(0);
  });

  test("should update nonce value properly", () => {
    const { result } = renderHook(() => useCreateIdentityModal(defaultHookProps));

    act(() => {
      result.current.onChangeNonce({ target: { value: "1" } } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.nonce).toBe(1);
  });

  test("should update web2 provider properly", () => {
    const { result } = renderHook(() => useCreateIdentityModal(defaultHookProps));

    act(() => {
      result.current.onSelectWeb2Provider({ target: { value: "github" } } as ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.web2Provider).toBe("github");
  });

  test("should update identity type properly", () => {
    const { result } = renderHook(() => useCreateIdentityModal(defaultHookProps));

    act(() => {
      result.current.onSelectIdentityType({ target: { value: "random" } } as ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.identityStrategyType).toBe("random");
  });

  test("should create identity properly", async () => {
    const { result } = renderHook(() => useCreateIdentityModal(defaultHookProps));

    act(() => {
      result.current.onSelectIdentityType({ target: { value: "random" } } as ChangeEvent<HTMLSelectElement>);
    });

    await act(async () => {
      result.current.onCreateIdentity();

      return Promise.resolve();
    });

    expect(useMetaMaskWalletInfo).toBeCalledTimes(1);
    expect(useIdentityFactory).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith("random", mockSignedMessage, {});
    expect(result.current.isLoading).toBe(false);
    expect(defaultHookProps.onClose).toBeCalledTimes(1);
  });

  test("should handle create identity error properly", async () => {
    const error = new Error("create-identity-error");

    (createIdentity as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useCreateIdentityModal(defaultHookProps));

    await act(async () => {
      result.current.onCreateIdentity();

      return Promise.resolve();
    });

    expect(result.current.error).toBe(error.message);
    expect(result.current.isLoading).toBe(false);
    expect(defaultHookProps.onClose).not.toBeCalled();
  });
});
