/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";

import { useResetPassword } from "../useResetPassword";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/validation", (): unknown => ({
  useValidationResolver: jest.fn(),
}));

describe("ui/pages/ResetPassword/useResetPassword", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
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

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useResetPassword());

    await act(async () =>
      Promise.resolve(result.current.register("password").onChange({ target: { value: "Password123@" } })),
    );

    await act(() =>
      Promise.resolve(result.current.register("confirmPassword").onChange({ target: { value: "Password123@" } })),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should show and hide password properly", () => {
    const { result } = renderHook(() => useResetPassword());

    act(() => result.current.onShowPassword());

    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(false);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useResetPassword());

    await act(async () => Promise.resolve(result.current.onClose()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });
});
