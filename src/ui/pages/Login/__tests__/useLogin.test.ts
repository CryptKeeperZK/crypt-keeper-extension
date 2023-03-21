/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { ChangeEvent, FormEvent } from "react";

import { useLogin } from "../useLogin";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Login/useLogin", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useLogin());

    expect(result.current.password).toBe("");
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("should change password properly", async () => {
    const { result } = renderHook(() => useLogin());

    await act(() =>
      Promise.resolve(
        result.current.onChangePassword({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.password !== "");

    expect(result.current.password).toBe("password");
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () =>
      Promise.resolve(
        result.current.onChangePassword({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.password !== "");

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should not submit form if password is empty", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.error !== "");

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Invalid password");
    expect(mockDispatch).not.toBeCalled();
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useLogin());

    await act(async () =>
      Promise.resolve(
        result.current.onChangePassword({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.password !== "");

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.error !== "" && result.current.isLoading !== true);

    expect(result.current.error).toBe(error.message);
    expect(result.current.isLoading).toBe(false);
  });
});
