/**
 * @jest-environment jsdom
 */

import { EWallet } from "@cryptkeeperzk/types";
import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { signWithSigner, getMessageTemplate } from "@src/ui/services/identity";

import { SignatureOptions, useCreateIdentity } from "../useCreateIdentity";

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

  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();
  const oldHref = window.location.href;

  Object.defineProperty(window, "location", {
    value: {
      href: oldHref,
    },
    writable: true,
  });

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (signWithSigner as jest.Mock).mockReturnValue(mockSignedMessage);

    (getMessageTemplate as jest.Mock).mockReturnValue(mockMessage);

    (createIdentity as jest.Mock).mockReturnValue(true);

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.location.href = oldHref;
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useCreateIdentity());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.control).toBeDefined();
    expect(result.current.errors).toStrictEqual({
      root: undefined,
      nonce: undefined,
    });
  });

  test("should create identity with eth wallet properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(SignatureOptions.ETH_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(createIdentity).toHaveBeenCalledTimes(1);
    expect(createIdentity).toHaveBeenCalledWith({
      groups: [],
      messageSignature: mockSignedMessage,
      urlOrigin: undefined,
      isDeterministic: true,
      options: { account: ZERO_ADDRESS, message: mockMessage, nonce: 0 },
      walletType: EWallet.ETH_WALLET,
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should create identity properly and go back", async () => {
    window.location.href = `${oldHref}?back=${Paths.CONNECT_IDENTITY}&urlOrigin=http://localhost:3000`;

    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(SignatureOptions.ETH_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(createIdentity).toHaveBeenCalledTimes(1);
    expect(createIdentity).toHaveBeenCalledWith({
      groups: [],
      urlOrigin: "http://localhost:3000",
      messageSignature: mockSignedMessage,
      isDeterministic: true,
      options: { account: ZERO_ADDRESS, message: mockMessage, nonce: 0 },
      walletType: EWallet.ETH_WALLET,
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      `${Paths.CONNECT_IDENTITY}?urlOrigin=http://localhost:3000&back=${Paths.CONNECT_IDENTITY}`,
    );
  });

  test("should connect eth wallet properly", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: false });
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(SignatureOptions.ETH_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(defaultWalletHookData.onConnect).toHaveBeenCalledTimes(1);
  });

  test("should handle error when trying to connect with eth wallet", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      isActive: false,
      onConnect: jest.fn(() => Promise.reject()),
    });

    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(SignatureOptions.ETH_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe("Wallet connection error");
  });

  test("should create identity with cryptkeeper properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(SignatureOptions.CRYPTKEEPER_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(signWithSigner).toHaveBeenCalledTimes(0);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(createIdentity).toHaveBeenCalledTimes(1);
    expect(createIdentity).toHaveBeenCalledWith({
      groups: [],
      messageSignature: undefined,
      urlOrigin: undefined,
      isDeterministic: true,
      options: { account: defaultWalletHookData.address, message: mockMessage, nonce: 0 },
      walletType: EWallet.CRYPTKEEPER_WALLET,
    });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should close modal properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(() => Promise.resolve(result.current.onCloseModal()));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test("should go back properly", async () => {
    window.location.href = `${oldHref}?back=${Paths.CONNECT_IDENTITY}`;

    const { result } = renderHook(() => useCreateIdentity());

    await act(() => Promise.resolve(result.current.onCloseModal()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("should go to import identity properly", async () => {
    window.location.href = oldHref;

    const { result } = renderHook(() => useCreateIdentity());

    await act(() => Promise.resolve(result.current.onGoToImportIdentity()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`${Paths.IMPORT_IDENTITY}?back=${Paths.CREATE_IDENTITY}&urlOrigin=`);
  });

  test("should go to import identity properly with redirect", async () => {
    window.location.href = `${oldHref}?back=${Paths.CONNECT_IDENTITY}`;

    const { result } = renderHook(() => useCreateIdentity());

    await act(() => Promise.resolve(result.current.onGoToImportIdentity()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`${Paths.IMPORT_IDENTITY}?back=${Paths.CONNECT_IDENTITY}&urlOrigin=`);
  });

  test("should handle create identity error properly", async () => {
    const error = new Error("create-identity-error");

    (createIdentity as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(SignatureOptions.CRYPTKEEPER_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe(error.message);
  });

  test("should handle unknown signature option properly", async () => {
    const { result } = renderHook(() => useCreateIdentity());

    await act(async () => Promise.resolve(result.current.onSign(9000)));

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});
