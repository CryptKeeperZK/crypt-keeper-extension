/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";

import { ZERO_ADDRESS } from "@src/config/const";
import { RPCAction } from "@src/constants";
import { EWallet, HistorySettings, OperationType, SelectedIdentity } from "@src/types";
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
  IdentitiesState,
  setIdentities,
  setIdentityRequestPending,
  setSelectedCommitment,
  useIdentities,
  useIdentityRequestPending,
  useSelectedIdentity,
  fetchHistory,
  useIdentityOperations,
  getHistory,
  setOperations,
  deleteHistoryOperation,
  clearHistory,
  useHistorySettings,
  setSettings,
  enableHistory,
  useLinkedIdentities,
  useUnlinkedIdentities,
} from "../identities";

jest.unmock("@src/ui/ducks/hooks");

describe("ui/ducks/identities", () => {
  const defaultIdentities: IdentitiesState["identities"] = [
    {
      commitment: "1",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #1",
        identityStrategy: "interrep",
        web2Provider: "twitter",
        groups: [],
        host: "http://localhost:3000",
      },
    },
    {
      commitment: "2",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #2",
        identityStrategy: "interrep",
        web2Provider: "twitter",
        groups: [],
      },
    },
  ];

  const defaultOperations: IdentitiesState["operations"] = [
    {
      id: "1",
      type: OperationType.CREATE_IDENTITY,
      createdAt: new Date().toISOString(),
      identity: defaultIdentities[0],
    },
  ];

  const defaultSettings: HistorySettings = { isEnabled: true };

  const defaultSelectedIdentity: SelectedIdentity = {
    commitment: defaultIdentities[0].commitment,
    web2Provider: defaultIdentities[0].metadata.web2Provider,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch identities properly", async () => {
    (postMessage as jest.Mock).mockResolvedValueOnce(defaultIdentities).mockResolvedValueOnce(defaultSelectedIdentity);

    await Promise.resolve(store.dispatch(fetchIdentities()));
    const { identities } = store.getState();
    const identitiesHookData = renderHook(() => useIdentities(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const linkedIdentitiesHookData = renderHook(() => useLinkedIdentities("http://localhost:3000"), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const unlinkedIdentitiesHookData = renderHook(() => useUnlinkedIdentities(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    const selectedIdentityHookData = renderHook(() => useSelectedIdentity(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.identities).toStrictEqual(defaultIdentities);
    expect(identitiesHookData.result.current).toStrictEqual(defaultIdentities);
    expect(linkedIdentitiesHookData.result.current).toStrictEqual(defaultIdentities.slice(0, 1));
    expect(unlinkedIdentitiesHookData.result.current).toStrictEqual(defaultIdentities.slice(1));
    expect(selectedIdentityHookData.result.current).toStrictEqual(defaultIdentities[0]);
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

  test("should get history properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue(defaultOperations);

    await Promise.resolve(store.dispatch(getHistory()));
    const { identities } = store.getState();
    const operationsHookData = renderHook(() => useIdentityOperations(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(identities.operations).toStrictEqual(defaultOperations);
    expect(operationsHookData.result.current).toStrictEqual(defaultOperations);
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

  test("should set selected commitment properly", async () => {
    await Promise.resolve(store.dispatch(setSelectedCommitment(defaultSelectedIdentity)));
    const { identities } = store.getState();

    expect(identities.selected.commitment).toBe("1");
    expect(identities.selected.web2Provider).toBe("twitter");
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
    await Promise.resolve(store.dispatch(createIdentityRequest()));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.CREATE_IDENTITY_REQ });
  });

  test("should call create identity action properly", async () => {
    await Promise.resolve(
      store.dispatch(
        createIdentity({
          walletType: EWallet.ETH_WALLET,
          strategy: "interrep",
          messageSignature: "signature",
          groups: [],
          host: "http://localhost:3000",
          options: { message: "message", account: ZERO_ADDRESS },
        }),
      ),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.CREATE_IDENTITY,
      payload: {
        strategy: "interrep",
        messageSignature: "signature",
        walletType: EWallet.ETH_WALLET,
        options: { message: "message", account: ZERO_ADDRESS },
      },
    });
  });

  test("should call set connected identity action properly", async () => {
    await Promise.resolve(
      store.dispatch(setConnectedIdentity({ identityCommitment: "1", host: "http://localhost:3000" })),
    );

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.SET_CONNECTED_IDENTITY,
      payload: {
        identityCommitment: "1",
        host: "http://localhost:3000",
      },
    });
  });

  test("should call set identity name action properly", async () => {
    await Promise.resolve(store.dispatch(setIdentityName("1", "name")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({
      method: RPCAction.SET_IDENTITY_NAME,
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
      method: RPCAction.DELETE_IDENTITY,
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
      method: RPCAction.DELETE_ALL_IDENTITIES,
    });
  });
});
