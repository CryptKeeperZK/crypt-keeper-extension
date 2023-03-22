/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { ChangeEvent, FormEvent } from "react";

import { useOnboarding } from "../useOnboarding";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Onboarding/useOnboarding", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isValid).toBe(false);
    expect(result.current.password).toBe("");
    expect(result.current.confirmPassword);
    expect(result.current.error).toBe("");
    expect(result.current.isLoading).toBe(false);
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () =>
      Promise.resolve(
        result.current.onChangePassword({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.password !== "");

    await act(() =>
      Promise.resolve(
        result.current.onChangeConfirmPassword({
          target: { value: "password" },
        } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.confirmPassword !== "");

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.isLoading !== true);

    expect(result.current.isValid).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.password).toBe("password");
    expect(result.current.confirmPassword).toBe("password");
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should not submit form if password is empty", async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.error !== "");

    expect(result.current.isValid).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Invalid password");
    expect(mockDispatch).not.toBeCalled();
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useOnboarding());

    await act(async () =>
      Promise.resolve(
        result.current.onChangePassword({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.password !== "");

    await act(() =>
      Promise.resolve(
        result.current.onChangeConfirmPassword({
          target: { value: "password" },
        } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await waitFor(() => result.current.confirmPassword !== "");

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.error !== "" && result.current.isLoading !== true);

    expect(result.current.error).toBe(error.message);
    expect(result.current.isLoading).toBe(false);
  });
});
