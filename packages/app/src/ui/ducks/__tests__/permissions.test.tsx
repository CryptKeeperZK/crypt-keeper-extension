/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { RPCInternalAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  checkHostApproval,
  fetchHostPermissions,
  removeHost,
  setHostPermissions,
  useHostPermission,
} from "../permissions";

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/permissions", () => {
  const defaultHost = "http://localhost:3000";
  const defaultPermission = {
    canSkipApprove: true,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch url origin permissions properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultPermission);

    await Promise.resolve(store.dispatch(fetchHostPermissions(defaultHost)));
    const { permissions } = store.getState();
    const { result } = renderHook(() => useHostPermission(defaultHost), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(permissions.canSkipApprovals).toStrictEqual({
      [defaultHost]: { urlOrigin: defaultHost, ...defaultPermission },
    });
    expect(result.current).toStrictEqual({ urlOrigin: defaultHost, ...defaultPermission });
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.GET_HOST_PERMISSIONS,
      payload: defaultHost,
    });
  });

  test("should set url origin permission properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue({ ...defaultPermission, canSkipApprove: false });

    await Promise.resolve(store.dispatch(setHostPermissions({ urlOrigin: defaultHost, canSkipApprove: false })));
    const { permissions } = store.getState();
    const { result } = renderHook(() => useHostPermission(defaultHost), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(permissions.canSkipApprovals).toStrictEqual({
      [defaultHost]: { urlOrigin: defaultHost, canSkipApprove: false },
    });
    expect(result.current).toStrictEqual({ urlOrigin: defaultHost, canSkipApprove: false });
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.SET_HOST_PERMISSIONS,
      payload: {
        urlOrigin: defaultHost,
        canSkipApprove: false,
      },
    });
  });

  test("should remove url origin properly", async () => {
    await Promise.resolve(store.dispatch(removeHost(defaultHost)));
    const { permissions } = store.getState();
    const { result } = renderHook(() => useHostPermission(defaultHost), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(permissions.canSkipApprovals).toStrictEqual({});
    expect(result.current).toBeUndefined();
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.REMOVE_HOST,
      payload: {
        urlOrigin: defaultHost,
      },
    });
  });

  test("should check url origin approval properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(true);

    const result = await store.dispatch(checkHostApproval(defaultHost));

    expect(result).toBe(true);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.IS_HOST_APPROVED,
      payload: defaultHost,
    });
  });
});
