/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { ChangeEvent } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, removeHost, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";
import { getLastActiveTabUrl } from "@src/util/browser";

import { IUsePermissionModalArgs, IUsePermissionModalData, usePermissionModal } from "../usePermissionModal";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/permissions", (): unknown => ({
  fetchHostPermissions: jest.fn(),
  setHostPermissions: jest.fn(),
  useHostPermission: jest.fn(),
  removeHost: jest.fn(),
}));

describe("ui/components/ConnectionModal/useConnectionModal", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultArgs: IUsePermissionModalArgs = {
    refreshConnectionStatus: jest.fn(),
    onClose: jest.fn(),
  };

  const defaultUrl = new URL("http://localhost:3000");

  const defaultPermission = { canSkipApprove: true };

  const waitForData = async (current: IUsePermissionModalData) => {
    await waitFor(() => current.url !== undefined);
    await waitFor(() => current.checked);
    await waitFor(() => current.faviconUrl !== "");
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useHostPermission as jest.Mock).mockReturnValue(defaultPermission);

    (getLastActiveTabUrl as jest.Mock).mockResolvedValue(defaultUrl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty data", () => {
    (getLastActiveTabUrl as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => usePermissionModal(defaultArgs));

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.url).toBeUndefined();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => usePermissionModal(defaultArgs));
    await waitForData(result.current);

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.url?.origin).toBe(defaultUrl.origin);
  });

  test("should set approval properly", async () => {
    const { result } = renderHook(() => usePermissionModal(defaultArgs));
    await waitForData(result.current);

    await act(async () =>
      Promise.resolve(result.current.onSetApproval({ target: { checked: true } } as ChangeEvent<HTMLInputElement>)),
    );

    expect(fetchHostPermissions).toHaveBeenCalledTimes(1);
    expect(fetchHostPermissions).toHaveBeenCalledWith(result.current.url?.origin);
    expect(setHostPermissions).toHaveBeenCalledTimes(1);
    expect(setHostPermissions).toHaveBeenCalledWith({
      urlOrigin: result.current.url?.origin,
      canSkipApprove: true,
    });
  });

  test("should remove url origin properly", async () => {
    const { result } = renderHook(() => usePermissionModal(defaultArgs));
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.onRemoveHost()));

    expect(fetchHostPermissions).toHaveBeenCalledTimes(1);
    expect(fetchHostPermissions).toHaveBeenCalledWith(result.current.url?.origin);
    expect(removeHost).toHaveBeenCalledTimes(1);
    expect(removeHost).toHaveBeenCalledWith(result.current.url?.origin);
    expect(defaultArgs.refreshConnectionStatus).toHaveBeenCalledTimes(1);
    expect(defaultArgs.onClose).toHaveBeenCalledTimes(1);
  });
});
