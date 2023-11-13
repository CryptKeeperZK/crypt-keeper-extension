/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { mockDefaultConnection } from "@src/config/mock/zk";
import { RPCInternalAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  type IConnectionsState,
  fetchConnections,
  useConnections,
  useConnection,
  revealConnectedIdentityCommitment,
  connect,
  disconnect,
  useConnectedOrigins,
} from "../connections";

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/identities", () => {
  const defaultConnections: IConnectionsState["connections"] = {
    [mockDefaultConnection.urlOrigin]: mockDefaultConnection,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch connections properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultConnections);

    await Promise.resolve(store.dispatch(fetchConnections()));
    const { connections } = store.getState();
    const connectionsHookData = renderHook(() => useConnections(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const connectionHookData = renderHook(
      () => useConnection(defaultConnections[mockDefaultConnection.urlOrigin].urlOrigin),
      { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
    );
    const emptyConnectionHookData = renderHook(() => useConnection(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const connectedOriginsHookData = renderHook(() => useConnectedOrigins(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(connections.connections).toStrictEqual(defaultConnections);
    expect(connectionsHookData.result.current).toStrictEqual(defaultConnections);
    expect(connectionHookData.result.current).toStrictEqual(defaultConnections[mockDefaultConnection.urlOrigin]);
    expect(emptyConnectionHookData.result.current).toBeUndefined();
    expect(connectedOriginsHookData.result.current).toStrictEqual({
      [mockDefaultConnection.commitment]: mockDefaultConnection.urlOrigin,
    });
  });

  test("should connect properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(true);

    await Promise.resolve(
      store.dispatch(
        connect({ urlOrigin: mockDefaultConnection.urlOrigin, commitment: mockDefaultConnection.commitment }),
      ),
    );

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.CONNECT,
      payload: {
        commitment: mockDefaultConnection.commitment,
      },
      meta: {
        urlOrigin: mockDefaultConnection.urlOrigin,
      },
    });
  });

  test("should disconnect properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(true);

    await Promise.resolve(store.dispatch(disconnect(mockDefaultConnection.commitment)));

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(postMessage).toHaveBeenNthCalledWith(1, {
      method: RPCInternalAction.DISCONNECT,
      payload: {
        identityCommitment: mockDefaultConnection.commitment,
      },
    });
    expect(postMessage).toHaveBeenNthCalledWith(2, {
      method: RPCInternalAction.GET_CONNECTIONS,
      payload: {},
    });
  });

  test("should reveal connected identity commitment properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(mockDefaultConnection.commitment);

    await Promise.resolve(store.dispatch(revealConnectedIdentityCommitment(mockDefaultConnection.urlOrigin)));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
      payload: {},
      meta: { urlOrigin: mockDefaultConnection.urlOrigin },
    });
  });
});
