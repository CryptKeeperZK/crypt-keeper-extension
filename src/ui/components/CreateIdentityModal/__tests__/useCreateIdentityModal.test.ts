/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { signIdentityMessage } from "@src/ui/services/identity";

import { IUseCreateIdentityModalArgs, useCreateIdentityModal } from "../useCreateIdentityModal";
import { ChangeEvent } from "react";
import { useWallet } from "@src/ui/hooks/wallet";
import { defaultWalletHookData } from "@src/config/mock/wallet";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/services/identity", (): unknown => ({
  signIdentityMessage: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  createIdentity: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/components/CreateIdentityModal/useCreateIdentityModal", () => {
  const defaultHookProps: IUseCreateIdentityModalArgs = {
    onClose: jest.fn(),
  };

  const mockSignedMessage = "signed-message";

  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (signIdentityMessage as jest.Mock).mockReturnValue(mockSignedMessage);

    (createIdentity as jest.Mock).mockReturnValue(true);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);
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

    expect(signIdentityMessage).toBeCalledTimes(1);
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
