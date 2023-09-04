/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { ChangeEvent, FormEvent } from "react";

import { useLogin } from "../useLogin";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Login/useLogin", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

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
    const { result } = renderHook(() => useLogin());

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
    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useLogin());

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
    await waitFor(() => result.current.errors.password !== "" && !result.current.isLoading);

    expect(result.current.errors.password).toBe(error.message);
    expect(result.current.isLoading).toBe(false);
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
