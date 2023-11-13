/**
 * @jest-environment jsdom
 */

import { EWallet } from "@cryptkeeperzk/types";
import { calculateIdentityCommitment, calculateIdentitySecret } from "@cryptkeeperzk/zk";
import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { useNavigate } from "react-router-dom";

import {
  mockArrayIdenityJsonFile,
  mockEmptyJsonFile,
  mockIdenityJsonFile,
  mockIdenityPrivateJsonFile,
  mockJsonFile,
} from "@src/config/mock/file";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import {
  mockDefaultConnection,
  mockDefaultIdentityCommitment,
  mockDefaultIdentitySecret,
  mockDefaultNullifier,
  mockDefaultTrapdoor,
} from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { importIdentity } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getImportMessageTemplate, signWithSigner } from "@src/ui/services/identity";
import { redirectToNewTab } from "@src/util/browser";

import { useImportIdentity } from "../useImportIdentity";

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  calculateIdentityCommitment: jest.fn(),
  calculateIdentitySecret: jest.fn(),
}));

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("link-preview-js", (): unknown => ({
  getLinkPreview: jest.fn(),
}));

jest.mock("@src/ui/services/identity", (): unknown => ({
  signWithSigner: jest.fn(),
  getImportMessageTemplate: jest.fn(),
}));

jest.mock("@src/ui/hooks/url", (): unknown => ({
  useSearchParam: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  importIdentity: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  rejectUserRequest: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/hooks/validation", (): unknown => ({
  ...jest.requireActual("@src/ui/hooks/validation"),
  useValidationResolver: jest.fn(),
}));

describe("ui/pages/ImportIdentity/useImportIdentity", () => {
  const defaultFaviconsData = { favicons: [`${mockDefaultConnection.urlOrigin}/favicon.ico`] };
  const defaultUrlParams = {
    urlOrigin: mockDefaultConnection.urlOrigin,
    trapdoor: mockDefaultTrapdoor,
    nullifier: mockDefaultNullifier,
  };
  const mockSignedMessage = "signed-message";
  const mockMessage = "message";

  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve(false));

  beforeEach(() => {
    (getLinkPreview as jest.Mock).mockResolvedValue(defaultFaviconsData);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSearchParam as jest.Mock).mockImplementation((arg: keyof typeof defaultUrlParams) => defaultUrlParams[arg]);

    (signWithSigner as jest.Mock).mockResolvedValue(mockSignedMessage);

    (getImportMessageTemplate as jest.Mock).mockReturnValue(mockMessage);

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

    (calculateIdentitySecret as jest.Mock).mockReturnValue(mockDefaultIdentitySecret);

    (calculateIdentityCommitment as jest.Mock).mockReturnValue(mockDefaultIdentityCommitment);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useImportIdentity());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.trapdoor).toBe(mockDefaultTrapdoor);
    expect(result.current.nullifier).toBe(mockDefaultNullifier);
    expect(result.current.secret).toBe(mockDefaultIdentitySecret);
    expect(result.current.commitment).toBe(mockDefaultIdentityCommitment);
    expect(result.current.errors).toStrictEqual({
      name: undefined,
      trapdoor: undefined,
      nullifier: undefined,
      root: undefined,
    });
  });

  test("should go back properly", async () => {
    (useSearchParam as jest.Mock).mockImplementation(() => "");

    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(rejectUserRequest).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
  });

  test("should go back properly without closing popup", async () => {
    (useSearchParam as jest.Mock).mockReturnValue(Paths.CREATE_IDENTITY);

    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(rejectUserRequest).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(0);
  });

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toHaveBeenCalledTimes(1);
    expect(redirectToNewTab).toHaveBeenCalledWith(mockDefaultConnection.urlOrigin);
  });

  test("should drop object file properly", async () => {
    const acceptedFiles = [mockIdenityJsonFile];

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.onDrop(acceptedFiles, []));

    expect(result.current.errors.root).toBeUndefined();
    expect(result.current.trapdoor).toBe("1");
    expect(result.current.nullifier).toBe("1");
  });

  test("should drop array file properly", async () => {
    const acceptedFiles = [mockArrayIdenityJsonFile];

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.onDrop(acceptedFiles, []));

    expect(result.current.errors.root).toBeUndefined();
    expect(result.current.trapdoor).toBe("2");
    expect(result.current.nullifier).toBe("2");
  });

  test("should drop private object file properly", async () => {
    const acceptedFiles = [mockIdenityPrivateJsonFile];

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.onDrop(acceptedFiles, []));

    expect(result.current.errors.root).toBeUndefined();
    expect(result.current.trapdoor).toBe("3");
    expect(result.current.nullifier).toBe("3");
  });

  test("should handle empty file properly", async () => {
    const acceptedFiles = [mockEmptyJsonFile];

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.onDrop(acceptedFiles, []));

    expect(result.current.errors.root).toBe("File is empty");
  });

  test("should drop files and handle reject errors properly", async () => {
    const rejectedFiles = [{ file: mockJsonFile, errors: [{ code: "code", message: "error" }] }];

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.onDrop([], rejectedFiles));

    expect(result.current.errors.root).toBe("error");
  });

  test("should handle file read error properly", async () => {
    const acceptedFiles: File[] = [];

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.onDrop(acceptedFiles, []));

    expect(result.current.errors.root).toBe(
      "Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'.",
    );
  });

  test("should submit with cryptkeeper properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit(EWallet.CRYPTKEEPER_WALLET)));

    expect(signWithSigner).toHaveBeenCalledTimes(0);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(importIdentity).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should connect eth wallet properly", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: false });
    const { result } = renderHook(() => useImportIdentity());

    await act(async () => Promise.resolve(result.current.onSubmit(EWallet.ETH_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(defaultWalletHookData.onConnect).toHaveBeenCalledTimes(1);
  });

  test("should handle error when trying to connect with eth wallet", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      isActive: false,
      onConnect: jest.fn(() => Promise.reject()),
    });

    const { result } = renderHook(() => useImportIdentity());

    await act(async () => Promise.resolve(result.current.onSubmit(EWallet.ETH_WALLET)));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe("Wallet connection error");
  });

  test("should handle error when trying to sign with eth wallet", async () => {
    const error = new Error("error");
    (signWithSigner as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useImportIdentity());

    await act(async () => Promise.resolve(result.current.onSubmit(EWallet.ETH_WALLET)));

    expect(mockDispatch).toHaveBeenCalledTimes(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe(error.message);
  });

  test("should submit with eth wallet properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit(EWallet.ETH_WALLET)));

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(importIdentity).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should submit and go back properly", async () => {
    (useSearchParam as jest.Mock).mockImplementation((arg: string) =>
      arg === "urlOrigin" ? mockDefaultConnection.urlOrigin : Paths.CONNECT_IDENTITY,
    );

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit(EWallet.CRYPTKEEPER_WALLET)));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(importIdentity).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      `${Paths.CONNECT_IDENTITY}?urlOrigin=${mockDefaultConnection.urlOrigin}&back=${Paths.CONNECT_IDENTITY}`,
    );
  });

  test("should submit and go home properly", async () => {
    (useSearchParam as jest.Mock).mockImplementation((arg: string) =>
      arg === "urlOrigin" ? mockDefaultConnection.urlOrigin : Paths.CREATE_IDENTITY,
    );

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit(EWallet.CRYPTKEEPER_WALLET)));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(importIdentity).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should handle submit error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit(EWallet.CRYPTKEEPER_WALLET)));
    await waitFor(() => result.current.errors.root);

    expect(result.current.errors.root).toBe(error.message);
  });

  test("should handle unknown signature option properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(async () => Promise.resolve(result.current.onSubmit(9000)));

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});
