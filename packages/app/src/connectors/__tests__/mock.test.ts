import { mockConnector, createMockConnectorHooks, MockConnector } from "../mock";

describe("connectors/mock", () => {
  test("should create mock connector properly", () => {
    const mock = new MockConnector({
      startActivation: jest.fn().mockReturnValue(jest.fn()),
      update: jest.fn(),
      resetState: jest.fn(),
    });

    expect(mock.activate()).resolves.not.toThrow();
    expect(mock.connectEagerly()).resolves.not.toThrow();
    expect(mock.deactivate()).resolves.not.toThrow();
    expect(mock.resetState()).resolves.not.toThrow();
    expect(mockConnector).toBeDefined();
  });

  test("should create default mock connector hooks", () => {
    const hooks = createMockConnectorHooks({});

    expect(hooks.useAccount()).toBeUndefined();
    expect(hooks.useAccounts()).toStrictEqual([]);
    expect(hooks.useChainId()).toBeUndefined();
    expect(hooks.useENSName()).toBeUndefined();
    expect(hooks.useENSNames()).toStrictEqual([]);
    expect(hooks.useIsActivating()).toBe(false);
    expect(hooks.useIsActive()).toBe(false);
    expect(hooks.useProvider()).toBeUndefined();
  });

  test("should create mock connector hooks", () => {
    const hooks = createMockConnectorHooks({
      accounts: ["0x0", "0x1"],
      ensNames: ["0x0.eth", "0x1.eth"],
      chainId: 1,
      isActivating: false,
      isActive: true,
    });

    expect(hooks.useAccount()).toBe("0x0");
    expect(hooks.useAccounts()).toStrictEqual(["0x0", "0x1"]);
    expect(hooks.useChainId()).toBe(1);
    expect(hooks.useENSName()).toBe("0x0.eth");
    expect(hooks.useENSNames()).toStrictEqual(["0x0.eth", "0x1.eth"]);
    expect(hooks.useIsActivating()).toBe(false);
    expect(hooks.useIsActive()).toBe(true);
    expect(hooks.useProvider()).toBeUndefined();
  });
});
