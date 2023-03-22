/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { RPCAction } from "@src/constants";
import { RequestResolutionStatus } from "@src/types";
import { useRequestsPending } from "@src/ui/ducks/requests";
import postMessage from "@src/util/postMessage";

import { IUseConfirmRequestModalData, useConfirmRequestModal } from "../useConfirmRequestModal";

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  useRequestsPending: jest.fn(),
}));

describe("ui/components/ConfirmRequestModal/useConfirmRequestModal", () => {
  const waitForData = async (current: IUseConfirmRequestModalData) => {
    await waitFor(() => current.loading !== true);
  };

  beforeEach(() => {
    (postMessage as jest.Mock).mockResolvedValue({});

    (useRequestsPending as jest.Mock).mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.pendingRequests).toHaveLength(0);
  });

  test("should accept properly", async () => {
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.accept()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.FINALIZE_REQUEST,
      payload: {
        id: undefined,
        status: RequestResolutionStatus.ACCEPT,
        data: undefined,
      },
    });
  });

  test("should handle accept error", async () => {
    const error = new Error("error");
    (postMessage as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.accept()));

    expect(result.current.error).toBe(error.message);
  });

  test("should reject properly", async () => {
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.reject()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.FINALIZE_REQUEST,
      payload: {
        id: undefined,
        status: "reject",
        data: undefined,
      },
    });
  });

  test("should handle reject error", async () => {
    const error = new Error("error");
    (postMessage as jest.Mock).mockRejectedValue(error);
    const { result } = renderHook(() => useConfirmRequestModal());
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.reject()));

    expect(result.current.error).toBe(error.message);
  });
});
