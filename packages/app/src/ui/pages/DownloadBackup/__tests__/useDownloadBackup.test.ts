/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { downloadBackup } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { downloadFile } from "@src/util/browser";

import type { ChangeEvent, FormEvent } from "react";

import { useDownloadBackup } from "../useDownloadBackup";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/backup", (): unknown => ({
  downloadBackup: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  downloadFile: jest.fn(),
}));

describe("ui/pages/DownloadBackup/useDownloadBackup", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (downloadBackup as jest.Mock).mockReturnValue("content");

    (downloadFile as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useDownloadBackup());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isShowPassword).toBe(false);
    expect(result.current.errors).toStrictEqual({ password: undefined });
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useDownloadBackup());

    await act(async () =>
      Promise.resolve(
        result.current
          .register("password")
          .onChange({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(downloadBackup).toBeCalledTimes(1);
    expect(downloadFile).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useDownloadBackup());

    await act(async () =>
      Promise.resolve(
        result.current
          .register("password")
          .onChange({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.errors.password !== "" && result.current.isLoading !== true);

    expect(result.current.errors.password).toBe(error.message);
    expect(result.current.isLoading).toBe(false);
  });

  test("should toggle password properly", () => {
    const { result } = renderHook(() => useDownloadBackup());

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(false);
  });
});
