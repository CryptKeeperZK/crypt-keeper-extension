/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { RPCAction } from "@src/constants";
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
    noApproval: true,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch host permissions properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultPermission);

    await Promise.resolve(store.dispatch(fetchHostPermissions(defaultHost)));
    const { permissions } = store.getState();
    const { result } = renderHook(() => useHostPermission(defaultHost), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(permissions.noApprovals).toStrictEqual({ [defaultHost]: { host: defaultHost, ...defaultPermission } });
    expect(result.current).toStrictEqual({ host: defaultHost, ...defaultPermission });
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.GET_HOST_PERMISSIONS,
      payload: defaultHost,
    });
  });

  test("should set host permission properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue({ ...defaultPermission, noApproval: false });

    await Promise.resolve(store.dispatch(setHostPermissions({ host: defaultHost, canSkipApprove: false })));
    const { permissions } = store.getState();
    const { result } = renderHook(() => useHostPermission(defaultHost), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(permissions.noApprovals).toStrictEqual({ [defaultHost]: { host: defaultHost, noApproval: false } });
    expect(result.current).toStrictEqual({ host: defaultHost, noApproval: false });
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.SET_HOST_PERMISSIONS,
      payload: {
        host: defaultHost,
        noApproval: false,
      },
    });
  });

  test("should remove host properly", async () => {
    await Promise.resolve(store.dispatch(removeHost(defaultHost)));
    const { permissions } = store.getState();
    const { result } = renderHook(() => useHostPermission(defaultHost), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(permissions.noApprovals).toStrictEqual({});
    expect(result.current).toBeUndefined();
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.REMOVE_HOST,
      payload: {
        host: defaultHost,
      },
    });
  });

  test("should check host approval properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(true);

    const result = await store.dispatch(checkHostApproval(defaultHost));

    expect(result).toBe(true);
    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.IS_HOST_APPROVED,
      payload: defaultHost,
    });
  });
});
