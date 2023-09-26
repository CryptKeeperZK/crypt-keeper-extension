/**
 * @jest-environment jsdom
 */

import { EventName } from "@cryptkeeperzk/providers";
import { IPendingRequest, PendingRequestType, RequestResolutionStatus } from "@cryptkeeperzk/types";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { RPCInternalAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  fetchPendingRequests,
  finalizeRequest,
  rejectUserRequest,
  setPendingRequests,
  usePendingRequests,
} from "../requests";

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/requests", () => {
  const defaultPendingRequests: IPendingRequest[] = [{ id: "1", windowId: 1, type: PendingRequestType.APPROVE }];

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

  test("should finalize request properly", async () => {
    await Promise.resolve(
      store.dispatch(
        finalizeRequest({
          id: "1",
          status: RequestResolutionStatus.ACCEPT,
        }),
      ),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.FINALIZE_REQUEST,
      payload: {
        id: "1",
        status: RequestResolutionStatus.ACCEPT,
      },
    });
  });

  test("should reject user request properly", async () => {
    await Promise.resolve(store.dispatch(rejectUserRequest({ type: "request" }, "urlOrigin")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.PUSH_EVENT,
      payload: {
        type: EventName.USER_REJECT,
        payload: {
          type: "request",
        },
      },
      meta: {
        urlOrigin: "urlOrigin",
      },
    });
  });

  test("should set pending requests properly", async () => {
    await Promise.resolve(store.dispatch(setPendingRequests(defaultPendingRequests)));
    const { requests } = store.getState();

    expect(requests.pendingRequests).toStrictEqual(defaultPendingRequests);
  });
});
