/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { IDENTITY_TYPES, Paths } from "@src/constants";
import { EWallet } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
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
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
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

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useCreateIdentity());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isProviderAvailable).toBe(true);
    expect(result.current.isWalletConnected).toBe(true);
    expect(result.current.isWalletInstalled).toBe(true);
    expect(result.current.control).toBeDefined();
    expect(result.current.errors).toStrictEqual({
      root: undefined,
      web2Provider: undefined,
      identityStrategyType: undefined,
      nonce: undefined,
    });
  });

  test("should create identity with eth wallet properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onCreateWithEthWallet()));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      messageSignature: mockSignedMessage,
      options: { account: ZERO_ADDRESS, message: mockMessage, nonce: 0, web2Provider: "twitter" },
      strategy: "interrep",
      walletType: EWallet.ETH_WALLET,
    });
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should create identity with eth wallet and disabled interrep identity properly", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: false });

    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onCreateWithEthWallet()));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toBeCalledTimes(0);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      messageSignature: undefined,
      options: { account: ZERO_ADDRESS, message: mockMessage },
      strategy: "random",
      walletType: EWallet.ETH_WALLET,
    });
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should connect eth wallet properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onConnectWallet()));

    expect(result.current.isLoading).toBe(false);
    expect(defaultWalletHookData.onConnect).toBeCalledTimes(1);
  });

  test("should handle error when trying to connect with eth wallet", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      onConnect: jest.fn(() => Promise.reject()),
    });

    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onConnectWallet()));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe("Wallet connection error");
  });

  test("should create identity with cryptkeeper properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onCreateWithCryptkeeper()));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toBeCalledTimes(0);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledTimes(1);
    expect(createIdentity).toBeCalledWith({
      messageSignature: undefined,
      options: { account: defaultWalletHookData.address, message: mockMessage, nonce: 0, web2Provider: "twitter" },
      strategy: "interrep",
      walletType: EWallet.CRYPT_KEEPER_WALLET,
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

    await act(async () => Promise.resolve(result.current.onCreateWithCryptkeeper()));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe(error.message);
  });
});
