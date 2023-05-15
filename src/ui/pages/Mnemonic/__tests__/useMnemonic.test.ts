/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { saveMnemonic, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { IUseTimeoutData, useTimeout } from "@src/ui/hooks/timeout";

import { useMnemonic } from "../useMnemonic";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/timeout", (): unknown => ({
  useTimeout: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  saveMnemonic: jest.fn(),
  useAppStatus: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  copyToClipboard: jest.fn(),
  downloadFile: jest.fn(),
}));

describe("ui/pages/Mnemonic/useMnemonic", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());
  const defaultTimeoutHookData: IUseTimeoutData = {
    isActive: false,
    setActive: jest.fn(),
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useAppStatus as jest.Mock).mockReturnValue({ isMnemonicGenerated: false });

    (useTimeout as jest.Mock).mockReturnValue(defaultTimeoutHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useMnemonic());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.mnemonic).toBeDefined();
  });

  test("should redirect to home if mnemonic is generated", async () => {
    (useAppStatus as jest.Mock).mockReturnValue({ isMnemonicGenerated: true });

    renderHook(() => useMnemonic());

    await waitFor(() => {
      expect(mockNavigate).toBeCalledTimes(1);
      expect(mockNavigate).toBeCalledWith(Paths.HOME);
    });
  });

  test("should save mnemonic and go home properly", async () => {
    const { result } = renderHook(() => useMnemonic());

    await act(() => Promise.resolve(result.current.onSaveMnemonic()));

    expect(mockDispatch).toBeCalledTimes(1);
    expect(saveMnemonic).toBeCalledTimes(1);
    expect(saveMnemonic).toBeCalledWith(result.current.mnemonic);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should set error if save mnemonic is not successful", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useMnemonic());

    await act(() => Promise.resolve(result.current.onSaveMnemonic()));

    expect(result.current.error).toBe(error.message);
    expect(mockNavigate).toBeCalledTimes(0);
  });
});
