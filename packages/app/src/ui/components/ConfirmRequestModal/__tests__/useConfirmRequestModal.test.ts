/**
 * @jest-environment jsdom
 */

import { RequestResolutionStatus } from "@cryptkeeperzk/types";
import { act, renderHook, waitFor } from "@testing-library/react";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, finalizeRequest, usePendingRequests } from "@src/ui/ducks/requests";

import { IUseConfirmRequestModalData, useConfirmRequestModal } from "../useConfirmRequestModal";

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  finalizeRequest: jest.fn(),
  fetchPendingRequests: jest.fn(),
  usePendingRequests: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/components/ConfirmRequestModal/useConfirmRequestModal", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const waitForData = async (current: IUseConfirmRequestModalData) => {
    await waitFor(() => !current.loading);
  };

  beforeEach(() => {
    (finalizeRequest as jest.Mock).mockResolvedValue(true);

    (fetchPendingRequests as jest.Mock).mockResolvedValue([]);

    (mockDispatch as jest.Mock).mockResolvedValue(undefined);

    (usePendingRequests as jest.Mock).mockReturnValue([{ id: "1" }]);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.pendingRequests).toHaveLength(1);
  });

  test("should accept properly", async () => {
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.accept()));
    await waitFor(() => !result.current.loading);

    expect(finalizeRequest).toBeCalledTimes(1);
    expect(finalizeRequest).toBeCalledWith({
      id: "1",
      status: RequestResolutionStatus.ACCEPT,
      data: undefined,
    });
    expect(fetchPendingRequests).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
  });

  test("should handle accept error", async () => {
    const error = new Error("error");
    (mockDispatch as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.accept()));
    await waitFor(() => !result.current.loading);

    expect(result.current.error).toBe(error.message);
  });

  test("should reject properly", async () => {
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.reject()));
    await waitFor(() => !result.current.loading);

    expect(finalizeRequest).toBeCalledTimes(1);
    expect(finalizeRequest).toBeCalledWith({
      id: "1",
      status: "reject",
      data: undefined,
    });
    expect(fetchPendingRequests).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
  });

  test("should close popup if trying to reject empty request", async () => {
    (usePendingRequests as jest.Mock).mockReturnValue([]);
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.reject()));
    await waitFor(() => !result.current.loading);

    expect(finalizeRequest).toBeCalledTimes(0);
    expect(fetchPendingRequests).toBeCalledTimes(0);
    expect(closePopup).toBeCalledTimes(1);
  });

  test("should handle reject error", async () => {
    const error = new Error("error");
    (mockDispatch as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.reject()));
    await waitFor(() => !result.current.loading);

    expect(result.current.error).toBe(error.message);
  });
});
