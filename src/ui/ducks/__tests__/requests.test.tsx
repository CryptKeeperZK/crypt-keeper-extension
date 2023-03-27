/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { PendingRequest, PendingRequestType } from "@src/types";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import { fetchPendingRequests, setPendingRequests, usePendingRequests } from "../requests";

describe("ui/ducks/requests", () => {
  const defaultPendingRequests: PendingRequest[] = [{ id: "1", windowId: 1, type: PendingRequestType.APPROVE }];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch pending requests properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultPendingRequests);

    await Promise.resolve(store.dispatch(fetchPendingRequests()));
    const { requests } = store.getState();
    const { result } = renderHook(() => usePendingRequests(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(requests.pendingRequests).toStrictEqual(defaultPendingRequests);
    expect(result.current).toStrictEqual(defaultPendingRequests);
  });

  test("should set pending requests properly", async () => {
    await Promise.resolve(store.dispatch(setPendingRequests(defaultPendingRequests)));
    const { requests } = store.getState();

    expect(requests.pendingRequests).toStrictEqual(defaultPendingRequests);
  });
});
