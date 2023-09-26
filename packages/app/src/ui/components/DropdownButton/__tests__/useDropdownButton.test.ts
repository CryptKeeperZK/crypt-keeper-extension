/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useRef } from "react";

import { IUseDropdownButtonArgs, useDropdownButton } from "../useDropdownButton";

jest.mock("react", (): unknown => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(),
}));

describe("ui/components/DropdownButton/useDropdownButton", () => {
  const defaultArgs: IUseDropdownButtonArgs = {
    onClick: jest.fn(),
  };

  const defaultRef = { current: null };

  beforeEach(() => {
    (useRef as jest.Mock).mockReturnValue(defaultRef);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useDropdownButton(defaultArgs));

    await waitFor(() => {
      expect(result.current.isMenuOpen).toBe(false);
      expect(result.current.selectedIndex).toBe(0);
      expect(result.current.menuRef).toBeDefined();
    });
  });

  test("should toggle menu properly", async () => {
    const { result } = renderHook(() => useDropdownButton(defaultArgs));

    await waitFor(() => {
      expect(result.current.isMenuOpen).toBe(false);
      expect(result.current.selectedIndex).toBe(0);
      expect(result.current.menuRef).toBeDefined();
    });
  });

  test("should toggle a menu properly", () => {
    const { result } = renderHook(() => useDropdownButton(defaultArgs));

    act(() => result.current.onToggleMenu());
    expect(result.current.isMenuOpen).toBe(true);

    act(() => result.current.onToggleMenu());
    expect(result.current.isMenuOpen).toBe(false);
  });

  test("should select a menu item properly", () => {
    const { result } = renderHook(() => useDropdownButton(defaultArgs));

    act(() => result.current.onMenuItemClick(0));
    expect(result.current.selectedIndex).toBe(0);

    act(() => result.current.onMenuItemClick(1));
    expect(result.current.selectedIndex).toBe(1);
  });

  test("should submit properly", () => {
    const { result } = renderHook(() => useDropdownButton(defaultArgs));

    act(() => result.current.onMenuItemClick(1));
    expect(result.current.selectedIndex).toBe(1);

    act(() => result.current.onSubmit());
    expect(defaultArgs.onClick).toBeCalledTimes(1);
    expect(defaultArgs.onClick).toBeCalledWith(1);
  });
});
