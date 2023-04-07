/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { usePasswordInput } from "@src/ui/components/PasswordInput/usePasswordInput";

describe("ui/components/PasswordInput/usePasswordInput", () => {
  test("should isShowPassword set to false as default", () => {
    const { result } = renderHook(() => usePasswordInput());

    expect(result.current.isShowPassword).toStrictEqual(false);
  });

  test("should be able to change isShowPassword", () => {
    const { result } = renderHook(() => usePasswordInput());

    act(() => result.current.onShowPassword());

    expect(result.current.isShowPassword).toStrictEqual(true);

    act(() => result.current.onShowPassword());
    expect(result.current.isShowPassword).toStrictEqual(false);
  });
});
