/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { resetPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useResetPassword } from "../useResetPassword";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  resetPassword: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/hooks/validation", (): unknown => ({
  ...jest.requireActual("@src/ui/hooks/validation"),
  useValidationResolver: jest.fn(),
}));

describe("ui/pages/ResetPassword/useResetPassword", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({ mnemonic: defaultMnemonic })]);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useResetPassword());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isShowPassword).toStrictEqual(false);
    expect(result.current.errors).toStrictEqual({ password: undefined, confirmPassword: undefined, root: undefined });
  });

  test("should redirect to home if there is no mnemonic", async () => {
    (useSearchParams as jest.Mock).mockReturnValue([new URLSearchParams({ mnemonic: "" })]);

    const { result } = renderHook(() => useResetPassword());

    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useResetPassword());

    await act(async () =>
      Promise.resolve(result.current.register("password").onChange({ target: { value: "Password123@" } })),
    );

    await act(() =>
      Promise.resolve(result.current.register("confirmPassword").onChange({ target: { value: "Password123@" } })),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(resetPassword).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should handle submit error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useResetPassword());

    await act(async () =>
      Promise.resolve(result.current.register("password").onChange({ target: { value: "Password123@" } })),
    );

    await act(() =>
      Promise.resolve(result.current.register("confirmPassword").onChange({ target: { value: "Password123@" } })),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe("error");
  });

  test("should show and hide password properly", () => {
    const { result } = renderHook(() => useResetPassword());

    act(() => {
      result.current.onShowPassword();
    });

    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => {
      result.current.onShowPassword();
    });
    expect(result.current.isShowPassword).toStrictEqual(false);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useResetPassword());

    await act(async () => Promise.resolve(result.current.onClose()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.RECOVER);
  });
});
