/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IDENTITY_TYPES, Paths } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import { signWithSigner, getMessageTemplate } from "@src/ui/services/identity";

import { useCreateIdentity } from "../useCreateIdentity";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/services/identity", (): unknown => ({
  signWithSigner: jest.fn(),
  getMessageTemplate: jest.fn(),
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
  const mockMessage = "message";

  const mockDispatch = jest.fn();

  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (signWithSigner as jest.Mock).mockReturnValue(mockSignedMessage);

    (getMessageTemplate as jest.Mock).mockReturnValue(mockMessage);

    (createIdentity as jest.Mock).mockReturnValue(true);

    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useCreateIdentity());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isProviderAvailable).toBe(true);
    expect(result.current.control).toBeDefined();
    expect(result.current.errors).toStrictEqual({
      root: undefined,
      web2Provider: undefined,
      identityStrategyType: undefined,
      nonce: undefined,
    });
  });

  test("should create identity properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSubmit()));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      messageSignature: mockSignedMessage,
      options: { account: ZERO_ADDRESS, message: mockMessage, nonce: 0, web2Provider: "twitter" },
      strategy: "interrep",
      walletType: 0,
    });
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
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

    await act(async () =>
      Promise.resolve(
        result.current.register("identityStrategyType").onChange({ target: { value: IDENTITY_TYPES[0] } }),
      ),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe(error.message);
  });
});
