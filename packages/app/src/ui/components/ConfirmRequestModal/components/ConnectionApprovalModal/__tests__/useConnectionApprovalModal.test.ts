/**
 * @jest-environment jsdom
 */

import { PendingRequestType } from "@cryptkeeperzk/types";
import { act, renderHook, waitFor } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchHostPermissions, setHostPermissions, useHostPermission } from "@src/ui/ducks/permissions";

import type { ChangeEvent } from "react";

import {
  IUseConnectionApprovalModalArgs,
  IUseConnectionApprovalModalData,
  useConnectionApprovalModal,
} from "../useConnectionApprovalModal";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/permissions", (): unknown => ({
  fetchHostPermissions: jest.fn(),
  setHostPermissions: jest.fn(),
  useHostPermission: jest.fn(),
}));

describe("ui/components/ConfirmRequestModal/components/ConnectionApprovalModal/useConnectionApprovalModal", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultArgs: IUseConnectionApprovalModalArgs = {
    pendingRequest: {
      id: "1",
      type: PendingRequestType.APPROVE,
      payload: { urlOrigin: "http://localhost:3000" },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const defaultPermission = { canSkipApprove: true };

  const waitForData = async (current: IUseConnectionApprovalModalData) => {
    await waitFor(() => current.checked);
    await waitFor(() => current.faviconUrl !== "");
    await waitFor(() => current.urlOrigin !== "");
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useHostPermission as jest.Mock).mockReturnValue(defaultPermission);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty data", () => {
    const { result } = renderHook(() =>
      useConnectionApprovalModal({ ...defaultArgs, pendingRequest: { id: "1", type: PendingRequestType.APPROVE } }),
    );

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.urlOrigin).toBe("");
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.urlOrigin).toBe(defaultArgs.pendingRequest.payload?.urlOrigin);
  });

  test("should accept approval properly", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onAccept();
    });

    expect(defaultArgs.accept).toBeCalledTimes(1);
  });

  test("should reject approval properly", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onReject();
    });

    expect(defaultArgs.reject).toBeCalledTimes(1);
  });

  test("should set approval properly", async () => {
    (mockDispatch as jest.Mock).mockResolvedValue({ ...defaultPermission, canSkipApprove: false });
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onSetApproval({ target: { checked: false } } as ChangeEvent<HTMLInputElement>);
    });
    await waitFor(() => !result.current.checked);

    expect(fetchHostPermissions).toBeCalledTimes(1);
    expect(fetchHostPermissions).toBeCalledWith(defaultArgs.pendingRequest.payload?.urlOrigin);
    expect(setHostPermissions).toBeCalledTimes(1);
    expect(setHostPermissions).toBeCalledWith({
      urlOrigin: defaultArgs.pendingRequest.payload?.urlOrigin,
      canSkipApprove: false,
    });
  });
});
