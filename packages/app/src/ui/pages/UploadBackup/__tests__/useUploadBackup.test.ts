/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { mockJsonFile } from "@src/config/mock/file";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useUploadBackup } from "../useUploadBackup";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/UploadBackup/useUploadBackup", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useUploadBackup());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isShowPassword).toBe(false);
    expect(result.current.errors).toStrictEqual({
      password: undefined,
      backupPassword: undefined,
      backupFile: undefined,
    });
  });

  test("should toggle password properly", () => {
    const { result } = renderHook(() => useUploadBackup());

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(false);
  });

  test("should go back properly", () => {
    const { result } = renderHook(() => useUploadBackup());

    act(() => result.current.onGoBack());

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should drop files properly", () => {
    const acceptedFiles = [mockJsonFile];

    const { result } = renderHook(() => useUploadBackup());

    act(() => result.current.onDrop(acceptedFiles, [], new Event("drop")));

    expect(result.current.errors.backupFile).toBeUndefined();
  });

  test("should drop files and handle reject errors properly", () => {
    const rejectedFiles = [{ file: mockJsonFile, errors: [{ code: "code", message: "error" }] }];

    const { result } = renderHook(() => useUploadBackup());

    act(() => result.current.onDrop([], rejectedFiles, new Event("drop")));

    expect(result.current.errors.backupFile).toBe("error");
  });
});
