/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { saveMnemonic, generateMnemonic, useAppStatus, useGeneratedMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

import { useGenerateMnemonic } from "../useGenerateMnemonic";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  saveMnemonic: jest.fn(),
  generateMnemonic: jest.fn(),
  useAppStatus: jest.fn(),
  useGeneratedMnemonic: jest.fn(),
}));

describe("ui/pages/GenerateMnemonic/useGenerateMnemonic", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());
  const defaultMnemonic = "mnemonic";

  beforeAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useAppStatus as jest.Mock).mockReturnValue({ isMnemonicGenerated: false });

    (useGeneratedMnemonic as jest.Mock).mockReturnValue(defaultMnemonic);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useGenerateMnemonic());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.mnemonic).toBe(defaultMnemonic);
    expect(result.current.error).toBe("");
  });

  test("should redirect to home if mnemonic is generated", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isMnemonicGenerated: true });

    renderHook(() => useGenerateMnemonic());

    await waitFor(() => {
      expect(mockNavigate).toBeCalledTimes(1);
      expect(mockNavigate).toBeCalledWith(Paths.HOME);
    });
  });

  test("should generate mnemonic properly", async () => {
    (useGeneratedMnemonic as jest.Mock).mockReturnValue(undefined);

    renderHook(() => useGenerateMnemonic());

    await waitFor(() => {
      expect(generateMnemonic).toBeCalledTimes(1);
    });
  });

  test("should save mnemonic and go home properly", async () => {
    const { result } = renderHook(() => useGenerateMnemonic());

    await act(() => Promise.resolve(result.current.onSaveMnemonic()));

    expect(mockDispatch).toBeCalledTimes(1);
    expect(saveMnemonic).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should set error if save mnemonic is not successful", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useGenerateMnemonic());

    await act(() => Promise.resolve(result.current.onSaveMnemonic()));

    expect(result.current.error).toBe(error.message);
    expect(mockNavigate).toBeCalledTimes(0);
  });
});
