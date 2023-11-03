/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { UseVerifiableCredentialItemArgs, useVerifiableCredentialItem } from "../useVerifiableCredentialItem";

describe("ui/components/VerifiableCredential/Item/useVerifiableCredentialItem", () => {
  const defaultHookArgs: UseVerifiableCredentialItemArgs = {
    metadata: {
      name: "My Credential",
      hash: "0x123456789",
    },
    onSelect: jest.fn(),
    onRename: jest.fn(),
    onDelete: jest.fn(),
  };

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

    expect(defaultHookArgs.onRename).toHaveBeenCalledTimes(1);
    expect(result.current.isRenaming).toBe(false);
  });

  test("should handle deletion properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));

    await act(async () => result.current.onRemove());

    expect(defaultHookArgs.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultHookArgs.onDelete).toHaveBeenCalledWith(defaultHookArgs.metadata.hash);
  });

  test("should handle selection properly", () => {
    const { result } = renderHook(() => useVerifiableCredentialItem(defaultHookArgs));

    act(() => result.current.onToggleSelect());

    expect(defaultHookArgs.onSelect).toHaveBeenCalledTimes(1);
    expect(defaultHookArgs.onSelect).toHaveBeenCalledWith(defaultHookArgs.metadata.hash);
  });
});
