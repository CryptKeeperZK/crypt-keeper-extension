/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { checkMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useValidationResolver } from "@src/ui/hooks/validation";

import { useRecover } from "../useRecover";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  checkMnemonic: jest.fn(),
}));

jest.mock("@src/ui/hooks/validation", (): unknown => ({
  ...jest.requireActual("@src/ui/hooks/validation"),
  useValidationResolver: jest.fn(),
}));

describe("ui/pages/Recover/useRecover", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useRecover());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toStrictEqual({ mnemonic: undefined });
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRecover());

    await act(async () => Promise.resolve(result.current.onClose()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should submit form properly", async () => {
    (useValidationResolver as jest.Mock).mockReturnValue(() => ({ values: { mnemonic: defaultMnemonic }, errors: {} }));

    const { result } = renderHook(() => useRecover());

    await act(async () =>
      Promise.resolve(
        result.current.register("mnemonic").onChange({
          target: { value: defaultMnemonic },
        }),
      ),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.isLoading === false);

    expect(result.current.isLoading).toBe(false);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(checkMnemonic).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(`${Paths.RESET_PASSWORD}?mnemonic=${defaultMnemonic}`);
  });

  test("should handle submit error", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useRecover());

    await act(() =>
      Promise.resolve(
        result.current.register("mnemonic").onChange({
          target: { value: defaultMnemonic },
        } as ChangeEvent<HTMLInputElement>),
      ),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.errors.mnemonic !== "" && result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors.mnemonic).toBe(error.message);
  });
});
