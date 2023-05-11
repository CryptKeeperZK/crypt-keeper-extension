/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { IUseTimeoutData, useTimeout } from "@src/ui/hooks/timeout";

import { useMnemonic } from "../useMnemonic";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/timeout", (): unknown => ({
  useTimeout: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  copyToClipboard: jest.fn(),
  downloadFile: jest.fn(),
}));

describe("ui/pages/Mnemonic/useMnemonic", () => {
  const mockNavigate = jest.fn();
  const defaultTimeoutHookData: IUseTimeoutData = {
    isActive: false,
    setActive: jest.fn(),
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

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

    expect(result.current.mnemonic).toBeDefined();
  });

  test("should go home properly", async () => {
    const { result } = renderHook(() => useMnemonic());

    await act(() => Promise.resolve(result.current.onGoHome()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });
});
