/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { usePendingRequests } from "@src/ui/ducks/requests";

import type { ChangeEvent, FormEvent } from "react";

import { useLogin } from "../useLogin";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  fetchPendingRequests: jest.fn(),
  usePendingRequests: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
  fetchStatus: jest.fn(),
  unlock: jest.fn(),
  useAppStatus: jest.fn(),
}));

describe("ui/pages/Login/useLogin", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const mockNavigate = jest.fn();

  beforeEach(() => {
    mockDispatch.mockResolvedValue(undefined);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useAppStatus as jest.Mock).mockReturnValue({ isUnlocked: false });

    (usePendingRequests as jest.Mock).mockReturnValue([]);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isShowPassword).toStrictEqual(false);
    expect(result.current.errors).toStrictEqual({ password: undefined });
  });

  test("should submit form properly", async () => {
    const { result, rerender } = renderHook(() => useLogin());

    await act(() =>
      result.current.register("password").onChange({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
    );

    await act(() => result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>));
    await waitFor(() => !result.current.isLoading);

    (useAppStatus as jest.Mock).mockReturnValue({ isUnlocked: true });

    rerender();

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(4);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useLogin());

    await act(() =>
      result.current.register("password").onChange({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
    );

    await act(() => result.current.onSubmit());
    await waitFor(() => result.current.errors.password !== "");

    expect(result.current.errors.password).toBe(error.message);
  });

  test("should toggle password visibility properly", () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.onShowPassword();
    });
    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => {
      result.current.onShowPassword();
    });
    expect(result.current.isShowPassword).toStrictEqual(false);
  });
});
