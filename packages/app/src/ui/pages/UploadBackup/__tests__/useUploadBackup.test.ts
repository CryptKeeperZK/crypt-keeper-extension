/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { mockJsonFile } from "@src/config/mock/file";
import { defaultWalletHookData } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { uploadBackup } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useCryptKeeperWallet } from "@src/ui/hooks/wallet";
import { readFile } from "@src/util/file";

import { useUploadBackup } from "../useUploadBackup";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useCryptKeeperWallet: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/backup", (): unknown => ({
  uploadBackup: jest.fn(),
}));

jest.mock("@src/util/file", (): unknown => ({
  readFile: jest.fn(),
}));

describe("ui/pages/UploadBackup/useUploadBackup", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (readFile as jest.Mock).mockResolvedValue({ target: { result: "{}" } });

    (useCryptKeeperWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useUploadBackup());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isShowPassword).toBe(false);
    expect(result.current.errors).toStrictEqual({
      password: undefined,
      backupPassword: undefined,
      backupFile: undefined,
      root: undefined,
    });
  });

  test("should toggle password properly", () => {
    const { result } = renderHook(() => useUploadBackup());

    act(() => {
      result.current.onShowPassword();
    });
    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => {
      result.current.onShowPassword();
    });
    expect(result.current.isShowPassword).toStrictEqual(false);
  });

  test("should go back properly", () => {
    const { result } = renderHook(() => useUploadBackup());

    act(() => {
      result.current.onGoBack();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.SETTINGS);
  });

  test("should drop files properly", () => {
    const acceptedFiles = [mockJsonFile];

    const { result } = renderHook(() => useUploadBackup());

    act(() => {
      result.current.onDrop(acceptedFiles, [], new Event("drop"));
    });

    expect(result.current.errors.backupFile).toBeUndefined();
  });

  test("should drop files and handle reject errors properly", () => {
    const rejectedFiles = [{ file: mockJsonFile, errors: [{ code: "code", message: "error" }] }];

    const { result } = renderHook(() => useUploadBackup());

    act(() => {
      result.current.onDrop([], rejectedFiles, new Event("drop"));
    });

    expect(result.current.errors.backupFile).toBe("error");
  });

  test("should submit properly", async () => {
    const { result } = renderHook(() => useUploadBackup());

    await act(async () =>
      Promise.resolve(result.current.register("password").onChange({ target: { value: "password" } })),
    );

    await act(() =>
      Promise.resolve(result.current.register("backupPassword").onChange({ target: { value: "backupPassword" } })),
    );

    await act(() => Promise.resolve(result.current.onDrop([mockJsonFile], [], new Event("drop"))));

    await act(() => Promise.resolve(result.current.onSubmit()));

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(uploadBackup).toHaveBeenCalledTimes(1);
    expect(defaultWalletHookData.onConnect).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should handle submit error properly", async () => {
    const error = new Error("error");
    (mockDispatch as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUploadBackup());

    await act(() => Promise.resolve(result.current.onSubmit()));

    expect(result.current.errors.root).toBe(error.message);
  });

  test("should handle empty file read error properly", async () => {
    (readFile as jest.Mock).mockResolvedValue("");

    const { result } = renderHook(() => useUploadBackup());

    await act(() => Promise.resolve(result.current.onSubmit()));

    expect(result.current.errors.root).toBe("Backup file is empty");
  });

  test("should handle file read error properly", async () => {
    const error = new Error("error");
    (readFile as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUploadBackup());

    await act(() => Promise.resolve(result.current.onSubmit()));

    expect(result.current.errors.root).toBe(error.message);
  });
});
