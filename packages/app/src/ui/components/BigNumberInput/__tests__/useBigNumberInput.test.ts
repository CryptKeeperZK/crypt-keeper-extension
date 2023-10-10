/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { type FocusEvent as ReactFocusEvent } from "react";

import { IUseBigNumberInputArgs, useBigNumberInput } from "../useBigNumberInput";

describe("ui/components/BigNumberInput/useBigNumberInput", () => {
  const defaultArgs: IUseBigNumberInputArgs = {
    onBlurHandler: jest.fn(),
    onFocusHandler: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useBigNumberInput(defaultArgs));
    await waitFor(() => result.current.isInitialized);

    expect(result.current.isFocused).toBe(false);
    expect(result.current.isHex).toBe(false);
  });

  test("should toogle dec/hex value properly", async () => {
    const { result } = renderHook(() => useBigNumberInput(defaultArgs));
    await waitFor(() => result.current.isInitialized);

    act(() => result.current.onToggleHex());

    expect(result.current.isHex).toBe(true);
  });

  test("should toogle focus value properly", async () => {
    const { result } = renderHook(() => useBigNumberInput(defaultArgs));
    await waitFor(() => result.current.isInitialized);

    act(() => result.current.onFocus({} as ReactFocusEvent<HTMLInputElement | HTMLTextAreaElement>));
    expect(result.current.isFocused).toBe(true);

    act(() => result.current.onBlur({} as ReactFocusEvent<HTMLInputElement | HTMLTextAreaElement>));
    expect(result.current.isFocused).toBe(false);
  });
});
