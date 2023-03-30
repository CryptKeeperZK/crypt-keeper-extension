/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { setupPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { ChangeEvent, FormEvent } from "react";

import { useOnboarding } from "../useOnboarding";

jest.mock("@src/ui/ducks/app", (): unknown => ({
  setupPassword: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/hooks/validation", (): unknown => ({
  useValidationResolver: jest.fn(),
}));

describe("ui/pages/Onboarding/useOnboarding", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (setupPassword as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toStrictEqual({ password: undefined, confirmPassword: undefined, root: undefined });
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useOnboarding());

    await act(async () =>
      Promise.resolve(result.current.register("password").onChange({ target: { value: "Password123@" } })),
    );

    await act(() =>
      Promise.resolve(result.current.register("confirmPassword").onChange({ target: { value: "Password123@" } })),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useOnboarding());

    await act(async () =>
      Promise.resolve(
        result.current
          .register("password")
          .onChange({ target: { value: "Password123@" } } as ChangeEvent<HTMLInputElement>),
      ),
    );

    await act(() =>
      Promise.resolve(
        result.current.register("confirmPassword").onChange({
          target: { value: "Password123@" },
        } as ChangeEvent<HTMLInputElement>),
      ),
    );

    await act(async () =>
      Promise.resolve(result.current.onSubmit({ preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>)),
    );
    await waitFor(() => result.current.errors.root !== "" && result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.root).toBe(error.message);
  });
});
