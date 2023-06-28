/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { useRecover } from "../useRecover";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

describe("ui/pages/Recover/useRecover", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
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
});
