/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { ChangeEvent } from "react";
import { browser } from "webextension-polyfill-ts";

import { RPCAction } from "@src/constants";
import postMessage from "@src/util/postMessage";

import { IUseConnectionModalArgs, IUseConnectionModalData, useConnectionModal } from "../useConnectionModal";

describe("ui/components/ConnectionModal/useConnectionModal", () => {
  const defaultArgs: IUseConnectionModalArgs = {
    refreshConnectionStatus: jest.fn(),
    onClose: jest.fn(),
  };

  const defaultTabs = [{ url: "http://localhost:3000" }];

  const defaultPostMessageResponse = { noApproval: true };

  const waitForData = async (current: IUseConnectionModalData) => {
    await waitFor(() => current.url !== undefined);
    await waitFor(() => current.checked === true);
    await waitFor(() => current.faviconUrl !== "");
  };

  beforeEach(() => {
    (postMessage as jest.Mock).mockResolvedValue(defaultPostMessageResponse);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty data", () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue([]);
    const { result } = renderHook(() => useConnectionModal(defaultArgs));

    expect(result.current.checked).toBe(false);
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.url).toBeUndefined();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectionModal(defaultArgs));
    await waitForData(result.current);

    expect(result.current.checked).toBe(true);
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.url?.origin).toBe(defaultTabs[0].url);
  });

  test("should set approval properly", async () => {
    const { result } = renderHook(() => useConnectionModal(defaultArgs));
    await waitForData(result.current);

    await act(async () =>
      Promise.resolve(result.current.onSetApproval({ target: { checked: true } } as ChangeEvent<HTMLInputElement>)),
    );

    expect(postMessage).toBeCalledTimes(2);
    expect(postMessage).toHaveBeenNthCalledWith(1, {
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: result.current.url?.origin,
    });
    expect(postMessage).toHaveBeenNthCalledWith(2, {
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host: result.current.url?.origin,
        noApproval: true,
      },
    });
  });

  test("should remove host properly", async () => {
    const { result } = renderHook(() => useConnectionModal(defaultArgs));
    await waitForData(result.current);

    await act(async () => Promise.resolve(result.current.onRemoveHost()));

    expect(postMessage).toBeCalledTimes(2);
    expect(postMessage).toHaveBeenNthCalledWith(1, {
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: result.current.url?.origin,
    });
    expect(postMessage).toHaveBeenNthCalledWith(2, {
      method: RPCAction.REMOVE_HOST,
      payload: {
        host: result.current.url?.origin,
      },
    });
    expect(defaultArgs.refreshConnectionStatus).toBeCalledTimes(1);
    expect(defaultArgs.onClose).toBeCalledTimes(1);
  });
});
