/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";
import { Paths } from "@src/constants";
import { checkPassword, getMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useRevealMnemonic } from "../useRevealMnemonic";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  getMnemonic: jest.fn(),
  checkPassword: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/RevealMnemonic/useRevealMnemonic", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve(defaultMnemonic));

  beforeAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useRevealMnemonic());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isShowPassword).toBe(false);
    expect(result.current.mnemonic).toBe("");
    expect(result.current.errors).toStrictEqual({
      password: undefined,
      root: undefined,
    });
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRevealMnemonic());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.SETTINGS);
  });

  test("should handle submit error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useRevealMnemonic());

    await act(() => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.errors.password !== "");

    expect(result.current.errors.root).toBe(error.message);
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useRevealMnemonic());

    await act(async () =>
      Promise.resolve(
        result.current
          .register("password")
          .onChange({ target: { value: "password" } } as ChangeEvent<HTMLInputElement>),
      ),
    );
    await act(() => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => !result.current.isLoading);

    expect(result.current.mnemonic).toBe(defaultMnemonic);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(checkPassword).toBeCalledTimes(1);
    expect(getMnemonic).toBeCalledTimes(1);
  });

  test("should toggle password visibility properly", () => {
    const { result } = renderHook(() => useRevealMnemonic());

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(false);
  });
});
