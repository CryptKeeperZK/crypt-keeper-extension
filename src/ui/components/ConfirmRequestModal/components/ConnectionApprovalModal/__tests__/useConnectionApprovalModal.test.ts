/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { RPCAction } from "@src/constants";
import { PendingRequestType } from "@src/types";
import postMessage from "@src/util/postMessage";

import type { ChangeEvent } from "react";

import { IUseConnectionApprovalModalArgs, useConnectionApprovalModal } from "../useConnectionApprovalModal";

describe("ui/components/ConfirmRequestModal/components/ConnectionApprovalModal/useConnectionApprovalModal", () => {
  const defaultArgs: IUseConnectionApprovalModalArgs = {
    pendingRequest: {
      id: "1",
      type: PendingRequestType.APPROVE,
      payload: { origin: "http://localhost:3000" },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const defaultPostMessageResponse = { noApproval: true };

  beforeEach(() => {
    (postMessage as jest.Mock).mockResolvedValue(defaultPostMessageResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty data", () => {
    const { result } = renderHook(() =>
      useConnectionApprovalModal({ ...defaultArgs, pendingRequest: { id: "1", type: PendingRequestType.APPROVE } }),
    );

    expect(result.current.checked).toBe(false);
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.host).toBe("");
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitFor(() => result.current.checked === true);

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.host).toBe(defaultArgs.pendingRequest.payload?.origin);
  });

  test("should accept approval properly", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitFor(() => result.current.checked === true);

    act(() => result.current.onAccept());

    expect(defaultArgs.accept).toBeCalledTimes(1);
  });

  test("should reject approval properly", async () => {
    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitFor(() => result.current.checked === true);

    act(() => result.current.onReject());

    expect(defaultArgs.reject).toBeCalledTimes(1);
  });

  test("should set approval properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue({ ...defaultPostMessageResponse, noApproval: false });

    const { result } = renderHook(() => useConnectionApprovalModal(defaultArgs));
    await waitFor(() => result.current.checked === true);

    act(() => result.current.onSetApproval({ target: { checked: false } } as ChangeEvent<HTMLInputElement>));
    await waitFor(() => result.current.checked === false);

    expect(postMessage).toBeCalledTimes(2);
    expect(postMessage).toHaveBeenNthCalledWith(1, {
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: defaultArgs.pendingRequest.payload?.origin,
    });
    expect(postMessage).toHaveBeenNthCalledWith(2, {
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host: defaultArgs.pendingRequest.payload?.origin,
        noApproval: false,
      },
    });
  });
});
