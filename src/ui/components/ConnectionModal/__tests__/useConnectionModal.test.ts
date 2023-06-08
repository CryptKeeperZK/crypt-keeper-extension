/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { ChangeEvent } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, removeHost, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";
import { getLastActiveTabUrl } from "@src/util/browser";

import { IUseConnectionModalArgs, IUseConnectionModalData, useConnectionModal } from "../useConnectionModal";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/permissions", (): unknown => ({
  fetchHostPermissions: jest.fn(),
  setHostPermissions: jest.fn(),
  useHostPermission: jest.fn(),
  removeHost: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  getLastActiveTabUrl: jest.fn(),
}));

describe("ui/components/ConnectionModal/useConnectionModal", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultArgs: IUseConnectionModalArgs = {
    refreshConnectionStatus: jest.fn(),
    onClose: jest.fn(),
  };

  const defaultUrl = new URL("http://localhost:3000");

  const defaultPermission = { canSkipApprove: true };

  const waitForData = async (current: IUseConnectionModalData) => {
    await waitFor(() => current.url !== undefined);
    await waitFor(() => current.checked === true);
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
    const { result } = renderHook(() => useConnectionModal(defaultArgs));

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.url).toBeUndefined();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectionModal(defaultArgs));
    await waitForData(result.current);

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.url?.origin).toBe(defaultUrl.origin);
  });

  test("should set approval properly", async () => {
    const { result } = renderHook(() => useConnectionModal(defaultArgs));
    await waitForData(result.current);

    await act(async () =>
      Promise.resolve(result.current.onSetApproval({ target: { checked: true } } as ChangeEvent<HTMLInputElement>)),
    );

    expect(fetchHostPermissions).toBeCalledTimes(1);
    expect(fetchHostPermissions).toBeCalledWith(result.current.url?.origin);
    expect(setHostPermissions).toBeCalledTimes(1);
    expect(setHostPermissions).toBeCalledWith({
      host: result.current.url?.origin,
      canSkipApprove: true,
    });
  });

  test("should remove host properly", async () => {
    const { result } = renderHook(() => useConnectionModal(defaultArgs));
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.onRemoveHost()));

    expect(fetchHostPermissions).toBeCalledTimes(1);
    expect(fetchHostPermissions).toBeCalledWith(result.current.url?.origin);
    expect(removeHost).toBeCalledTimes(1);
    expect(removeHost).toBeCalledWith(result.current.url?.origin);
    expect(defaultArgs.refreshConnectionStatus).toBeCalledTimes(1);
    expect(defaultArgs.onClose).toBeCalledTimes(1);
  });
});
