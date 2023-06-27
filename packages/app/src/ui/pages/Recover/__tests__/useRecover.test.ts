/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { defaultMnemonic } from "@src/config/mock/wallet";

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
    expect(result.current.errors).toStrictEqual({ mnemonic: undefined, root: undefined });
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRecover());

    await act(async () => Promise.resolve(result.current.onClose()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should submit form properly", async () => {
    const { result } = renderHook(() => useRecover());

    await act(async () =>
      Promise.resolve(result.current.register("mnemonic").onChange({ target: { value: defaultMnemonic } })),
    );

    await act(async () => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.isLoading !== true);

    expect(result.current.isLoading).toBe(false);
  });
});
