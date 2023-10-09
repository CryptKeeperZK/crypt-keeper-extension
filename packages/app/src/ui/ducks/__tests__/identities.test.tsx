/**
 * @jest-environment jsdom
 */

import { EWallet, IIdentityMetadata } from "@cryptkeeperzk/types";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { ZERO_ADDRESS } from "@src/config/const";
import { RPCInternalAction } from "@src/constants";
import { HistorySettings, OperationType } from "@src/types";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import {
  createIdentityRequest,
  createIdentity,
  setConnectedIdentity,
  setIdentityName,
  deleteIdentity,
  deleteAllIdentities,
  fetchIdentities,
  IIdentitiesState,
  setIdentities,
  setIdentityRequestPending,
  connectIdentity,
  useIdentities,
  useIdentityRequestPending,
  useConnectedIdentity,
  fetchHistory,
  useIdentityOperations,
  setOperations,
  deleteHistoryOperation,
  clearHistory,
  useHistorySettings,
  setSettings,
  enableHistory,
  useLinkedIdentities,
  useUnlinkedIdentities,
  useIdentity,
  revealConnectedIdentityCommitment,
} from "../identities";

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/identities", () => {
  const defaultIdentities: IIdentitiesState["identities"] = [
    {
      commitment: "1",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #1",
        groups: [],
        urlOrigin: "http://localhost:3000",
        isDeterministic: true,
        isImported: false,
      },
    },
    {
      commitment: "2",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #2",
        groups: [],
        isDeterministic: true,
        isImported: false,
      },
    },
  ];

  const defaultOperations: IIdentitiesState["operations"] = [
    {
      id: "1",
      type: OperationType.CREATE_IDENTITY,
      createdAt: new Date().toISOString(),
      identity: defaultIdentities[0],
    },
  ];

  const defaultSettings: HistorySettings = { isEnabled: true };

  const defaultConnectedIdentityMetadata: IIdentityMetadata = {
    ...defaultIdentities[0].metadata,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch identities properly", async () => {
    (postMessage as jest.Mock)
      .mockResolvedValueOnce(defaultIdentities)
      .mockResolvedValueOnce(defaultConnectedIdentityMetadata)
      .mockResolvedValueOnce(defaultIdentities[0].commitment);

    await Promise.resolve(store.dispatch(fetchIdentities()));
    const { identities } = store.getState();
    const identitiesHookData = renderHook(() => useIdentities(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const identityHookData = renderHook(() => useIdentity(defaultIdentities[0].commitment), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const emptyIdentityHookData = renderHook(() => useIdentity(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const linkedIdentitiesHookData = renderHook(() => useLinkedIdentities("http://localhost:3000"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const unlinkedIdentitiesHookData = renderHook(() => useUnlinkedIdentities(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const connectedIdentityHookData = renderHook(() => useConnectedIdentity(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.identities).toStrictEqual(defaultIdentities);
    expect(identitiesHookData.result.current).toStrictEqual(defaultIdentities);
    expect(identityHookData.result.current).toStrictEqual(defaultIdentities[0]);
    expect(emptyIdentityHookData.result.current).toBeUndefined();
    expect(linkedIdentitiesHookData.result.current).toStrictEqual(defaultIdentities.slice(0, 1));
    expect(unlinkedIdentitiesHookData.result.current).toStrictEqual(defaultIdentities.slice(1));
    expect(connectedIdentityHookData.result.current).toStrictEqual(defaultIdentities[0]);
  });

  test("should fetch history properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue({ operations: defaultOperations, settings: defaultSettings });

    await Promise.resolve(store.dispatch(fetchHistory()));
    const { identities } = store.getState();
    const operationsHookData = renderHook(() => useIdentityOperations(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const settingsHookData = renderHook(() => useHistorySettings(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.operations).toStrictEqual(defaultOperations);
    expect(identities.settings).toStrictEqual(defaultSettings);
    expect(operationsHookData.result.current).toStrictEqual(defaultOperations);
    expect(settingsHookData.result.current).toStrictEqual(defaultSettings);
  });

  test("should delete history operation properly", async () => {
    const expectedOperations = defaultOperations.slice(1);
    (postMessage as jest.Mock).mockResolvedValue(expectedOperations);

    await Promise.resolve(store.dispatch(deleteHistoryOperation(defaultOperations[0].id)));
    const { identities } = store.getState();
    const operationsHookData = renderHook(() => useIdentityOperations(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.operations).toStrictEqual(expectedOperations);
    expect(operationsHookData.result.current).toStrictEqual(expectedOperations);
  });

  test("should clear history properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(undefined);

    await Promise.resolve(store.dispatch(clearHistory()));
    const { identities } = store.getState();
    const operationsHookData = renderHook(() => useIdentityOperations(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.operations).toHaveLength(0);
    expect(operationsHookData.result.current).toHaveLength(0);
  });

  test("should set operations properly", async () => {
    await Promise.resolve(store.dispatch(setOperations(defaultOperations)));
    const { identities } = store.getState();

    expect(identities.operations).toStrictEqual(defaultOperations);
  });

  test("should set connected identity properly", async () => {
    await Promise.resolve(store.dispatch(setConnectedIdentity(defaultConnectedIdentityMetadata)));
    const { identities } = store.getState();

    expect(identities.connectedMetadata).toStrictEqual(defaultIdentities[0].metadata);
  });

  test("should set identities properly", async () => {
    await Promise.resolve(store.dispatch(setIdentities(defaultIdentities)));
    const { identities } = store.getState();

    expect(identities.identities).toStrictEqual(defaultIdentities);
  });

  test("should set identity request pending properly", async () => {
    await Promise.resolve(store.dispatch(setIdentityRequestPending(true)));
    const { identities } = store.getState();
    const { result } = renderHook(() => useIdentityRequestPending(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.requestPending).toBe(true);
    expect(result.current).toBe(true);
  });

  test("should call create identity request action properly", async () => {
    await Promise.resolve(store.dispatch(createIdentityRequest({ urlOrigin: "http://localhost:3000" })));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.CREATE_IDENTITY_REQUEST,
      payload: { urlOrigin: "http://localhost:3000" },
    });
  });

  test("should call create identity action properly", async () => {
    await Promise.resolve(
      store.dispatch(
        createIdentity({
          walletType: EWallet.ETH_WALLET,
          messageSignature: "signature",
          isDeterministic: true,
          groups: [],
          urlOrigin: "http://localhost:3000",
          options: { message: "message", account: ZERO_ADDRESS, nonce: 0 },
        }),
      ),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.CREATE_IDENTITY,
      payload: {
        messageSignature: "signature",
        walletType: EWallet.ETH_WALLET,
        isDeterministic: true,
        groups: [],
        urlOrigin: "http://localhost:3000",
        options: { message: "message", account: ZERO_ADDRESS, nonce: 0 },
      },
    });
  });

  test("should reveal identity commitment properly", async () => {
    await Promise.resolve(store.dispatch(revealConnectedIdentityCommitment()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
    });
  });

  test("should call set connected identity action properly", async () => {
    await Promise.resolve(
      store.dispatch(connectIdentity({ identityCommitment: "1", urlOrigin: "http://localhost:3000" })),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.CONNECT_IDENTITY,
      payload: {
        identityCommitment: "1",
        urlOrigin: "http://localhost:3000",
      },
    });
  });

  test("should call set identity name action properly", async () => {
    await Promise.resolve(store.dispatch(setIdentityName("1", "name")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.SET_IDENTITY_NAME,
      payload: {
        identityCommitment: "1",
        name: "name",
      },
    });
  });

  test("should call delete identity action properly", async () => {
    await Promise.resolve(store.dispatch(deleteIdentity("1")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.DELETE_IDENTITY,
      payload: {
        identityCommitment: "1",
      },
    });
  });

  test("should set settings properly", async () => {
    await Promise.resolve(store.dispatch(setSettings({ isEnabled: true })));
    const settingsHookData = renderHook(() => useHistorySettings(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(settingsHookData.result.current).toStrictEqual(defaultSettings);
  });

  test("should enable history properly", async () => {
    await Promise.resolve(store.dispatch(enableHistory(true)));
    const settingsHookData = renderHook(() => useHistorySettings(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(settingsHookData.result.current).toStrictEqual(defaultSettings);
  });

  test("should call delete all identities action properly", async () => {
    await Promise.resolve(store.dispatch(deleteAllIdentities()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCInternalAction.DELETE_ALL_IDENTITIES,
    });
  });
});
