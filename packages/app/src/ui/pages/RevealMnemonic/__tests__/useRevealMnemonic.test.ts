/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useRevealMnemonic } from "../useRevealMnemonic";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  getMnemonic: jest.fn(),
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

  test("should return initial data", async () => {
    const { result } = renderHook(() => useRevealMnemonic());

    await waitFor(() => result.current.mnemonic);

    expect(result.current.mnemonic).toBe(defaultMnemonic);
    expect(result.current.error).toBe("");
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRevealMnemonic());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should set error if save mnemonic is not successful", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useRevealMnemonic());

    await waitFor(() => result.current.error !== "");

    expect(result.current.error).toBe(error.message);
  });
});
