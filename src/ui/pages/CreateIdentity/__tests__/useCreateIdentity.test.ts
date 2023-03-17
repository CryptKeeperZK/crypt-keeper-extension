/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { ChangeEvent } from "react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import { signIdentityMessage } from "@src/ui/services/identity";

import { useCreateIdentity } from "../useCreateIdentity";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/services/identity", (): unknown => ({
  signIdentityMessage: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  createIdentity: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

describe("ui/pages/CreateIdentity/useCreateIdentity", () => {
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
    const { result } = renderHook(() => useCreateIdentity());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.identityStrategyType.value).toBe("interrep");
    expect(result.current.web2Provider.value).toBe("twitter");
    expect(result.current.nonce).toBe(0);
  });

  test("should update nonce value properly", () => {
    const { result } = renderHook(() => useCreateIdentity());

    act(() => {
      result.current.onChangeNonce({ target: { value: "1" } } as ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.nonce).toBe(1);
  });

  test("should update web2 provider properly", () => {
    const { result } = renderHook(() => useCreateIdentity());

    act(() => {
      result.current.onSelectWeb2Provider(WEB2_PROVIDER_OPTIONS[2], {
        action: "select-option",
        option: IDENTITY_TYPES[2],
      });
    });

    expect(result.current.web2Provider).toStrictEqual(WEB2_PROVIDER_OPTIONS[2]);
  });

  test("should update identity type properly", () => {
    const { result } = renderHook(() => useCreateIdentity());

    act(() => {
      result.current.onSelectIdentityType(IDENTITY_TYPES[1], { action: "select-option", option: IDENTITY_TYPES[1] });
    });

    expect(result.current.identityStrategyType).toStrictEqual(IDENTITY_TYPES[1]);
  });

  test("should create identity properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    act(() => {
      result.current.onSelectIdentityType(IDENTITY_TYPES[1], { action: "select-option", option: IDENTITY_TYPES[1] });
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
  });

  test("should close modal properly", () => {
    const { result } = renderHook(() => useCreateIdentity());

    act(() => result.current.closeModal());

    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should handle create identity error properly", async () => {
    const error = new Error("create-identity-error");

    (createIdentity as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => {
      result.current.onCreateIdentity();

      return Promise.resolve();
    });

    expect(result.current.error).toBe(error.message);
    expect(result.current.isLoading).toBe(false);
  });
});
