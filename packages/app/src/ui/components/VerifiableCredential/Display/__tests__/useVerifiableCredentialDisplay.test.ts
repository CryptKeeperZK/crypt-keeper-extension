/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { UseVerifiableCredentialDisplayArgs, useVerifiableCredentialDisplay } from "../useVerifiableCredentialDisplay";

describe("ui/components/VerifiableCredential/Display/useVerifiableCredentialDisplay", () => {
  const useVerifiableCredentialDisplayArgs: UseVerifiableCredentialDisplayArgs = {
    initialName: "My Credential",
    onRename: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useVerifiableCredentialDisplay(useVerifiableCredentialDisplayArgs));

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.name).toBe(useVerifiableCredentialDisplayArgs.initialName);
  });

  test("should toggle renaming properly", () => {
    const { result } = renderHook(() => useVerifiableCredentialDisplay(useVerifiableCredentialDisplayArgs));

    act(() => {
      result.current.onToggleRenaming();
    });

    expect(result.current.isRenaming).toBe(true);
  });

  test("should handle submission properly", () => {
    const { result } = renderHook(() => useVerifiableCredentialDisplay(useVerifiableCredentialDisplayArgs));
    const mockEvent = {} as React.FormEvent<HTMLFormElement>;
    mockEvent.preventDefault = jest.fn();

    act(() => {
      result.current.onToggleRenaming();
    });
    act(() => {
      result.current.onSubmit(mockEvent);
    });

    expect(useVerifiableCredentialDisplayArgs.onRename).toHaveBeenCalledTimes(1);
    expect(result.current.isRenaming).toBe(false);
  });
});
