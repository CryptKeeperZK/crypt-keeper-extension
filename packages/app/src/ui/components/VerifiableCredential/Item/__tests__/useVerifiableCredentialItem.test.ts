/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { UseVerifiableCredentialItemArgs, useVerifiableCredentialItem } from "../useVerifiableCredentialItem";

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

describe("ui/components/VerifiableCredential/Item/useVerifiableCredentialItem", () => {
  const mockDispatch = jest.fn();

  const defaultHookArgs: UseVerifiableCredentialItemArgs = {
    metadata: {
      name: "My Credential",
      hash: "0x123456789",
    },
    onSelect: jest.fn(),
    onRename: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));

    expect(result.current.isRenaming).toBe(false);
    expect(result.current.name).toBe(defaultHookArgs.metadata.name);
  });

  test("should toggle renaming properly", () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));

    act(() => {
      result.current.onToggleRenaming();
    });

    expect(result.current.isRenaming).toBe(true);
  });

  test("should handle submission properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));
    const mockEvent = {} as React.FormEvent<HTMLFormElement>;
    mockEvent.preventDefault = jest.fn();

    await act(async () => Promise.resolve(result.current.onToggleRenaming()));
    await act(async () => Promise.resolve(result.current.onSubmit(mockEvent)));

    expect(defaultHookArgs.onRename).toBeCalledTimes(1);
    expect(result.current.isRenaming).toBe(false);
  });

  test("should handle deletion properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));

    await act(async () => result.current.onDelete());

    expect(defaultHookArgs.onDelete).toBeCalledTimes(1);
    expect(defaultHookArgs.onDelete).toBeCalledWith(defaultHookArgs.metadata.hash);
  });

  test("should handle selection properly", () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));

    act(() => result.current.onToggleSelect());

    expect(defaultHookArgs.onSelect).toBeCalledTimes(1);
    expect(defaultHookArgs.onSelect).toBeCalledWith(defaultHookArgs.metadata.hash);
  });
});
