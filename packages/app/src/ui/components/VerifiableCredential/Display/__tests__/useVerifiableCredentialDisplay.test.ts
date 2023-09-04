/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { UseVerifiableCredentialDisplayArgs, useVerifiableCredentialDisplay } from "../useVerifiableCredentialDisplay";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVerifiableCredential: jest.fn(),
  rejectVerifiableCredentialRequest: jest.fn(),
  renameVerifiableCredential: jest.fn(),
  deleteVerifiableCredential: jest.fn(),
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
}));

describe("ui/components/VerifiableCredential/Display/useVerifiableCredentialDisplay", () => {
  const mockDispatch = jest.fn();

  const useVerifiableCredentialDisplayArgs: UseVerifiableCredentialDisplayArgs = {
    initialName: "My Credential",
    onRename: jest.fn(),
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

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

    expect(useVerifiableCredentialDisplayArgs.onRename).toBeCalledTimes(1);
    expect(result.current.isRenaming).toBe(false);
  });
});
