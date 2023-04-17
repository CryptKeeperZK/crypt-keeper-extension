import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { Operation, OperationType } from "@src/types";

import HistoryService from "..";
import LockService from "../../lock";
import SimpleStorage from "../../simpleStorage";

jest.mock("../../lock", (): unknown => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({ encrypt: jest.fn(), decrypt: jest.fn() })),
  },
}));

jest.mock("../../simpleStorage");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/history", () => {
  const service = HistoryService.getInstance();

  const defaultOperations: Operation[] = [
    {
      id: "1",
      type: OperationType.CREATE_IDENTITY,
      identity: {
        commitment: "1234",
        metadata: { identityStrategy: "random", account: ZERO_ADDRESS, name: "Account #1" },
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: OperationType.CREATE_IDENTITY,
      identity: {
        commitment: "1234",
        metadata: { identityStrategy: "interrep", account: ZERO_ADDRESS, name: "Account #2" },
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      type: OperationType.DELETE_IDENTITY,
      identity: {
        commitment: "1234",
        metadata: { identityStrategy: "interrep", account: ZERO_ADDRESS, name: "Account #3" },
      },
      createdAt: new Date().toISOString(),
    },
  ];
  const serializedDefaultOperations = JSON.stringify(defaultOperations);

  const defaultSettings = { isEnabled: true };
  const serializedDefaultSettings = JSON.stringify(defaultSettings);

  const defaultLockService = {
    decrypt: jest.fn(),
    encrypt: jest.fn(),
  };

  beforeEach(() => {
    defaultLockService.encrypt.mockReturnValue(serializedDefaultOperations);
    defaultLockService.decrypt.mockReturnValue(serializedDefaultOperations);

    (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: true });
  });

  afterEach(async () => {
    await service.clear();
  });

  test("should load history operations properly", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(serializedDefaultSettings);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(settings).toStrictEqual(defaultSettings);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations with empty history settings", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(null);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(settings).toStrictEqual(defaultSettings);
    expect(service.getOperations()).toStrictEqual(operations);
    expect(service.getSettings()).toStrictEqual(defaultSettings);
  });

  test("should load history operations without random identities", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: false });

    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(serializedDefaultSettings);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(2);
    expect(settings).toStrictEqual(defaultSettings);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations if history is disabled", async () => {
    const [, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    settingsStore.get.mockResolvedValueOnce(JSON.stringify({ ...defaultSettings, isEnabled: false }));

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(0);
    expect(settings).toStrictEqual({ isEnabled: false });
    expect(service.getOperations()).toHaveLength(0);
  });

  test("should load history operations properly if the store is empty", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(null);
    settingsStore.get.mockResolvedValueOnce(serializedDefaultSettings);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(0);
    expect(settings).toStrictEqual(defaultSettings);
    expect(service.getOperations()).toHaveLength(0);
  });

  test("should get cached operations without loading from store", () => {
    const operations = service.getOperations();

    expect(operations).toHaveLength(0);
  });

  test("should filter cached operations by type", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(serializedDefaultSettings);

    await service.loadOperations();
    const operations = service.getOperations({ type: OperationType.CREATE_IDENTITY });

    expect(operations).toHaveLength(2);
  });

  test("should track operation properly", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(serializedDefaultSettings);

    await service.loadOperations();
    await service.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: defaultOperations[0].identity,
    });
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(4);
  });

  test("should not track operation if history is disabled", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(JSON.stringify({ ...defaultSettings, isEnabled: false }));

    await service.loadOperations();
    await service.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: defaultOperations[0].identity,
    });
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(0);
  });

  test("should remove operation properly", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(serializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(serializedDefaultSettings);

    await service.loadOperations();
    await service.removeOperation(defaultOperations[0].id);
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(2);
  });

  test("should enable/disable history properly", async () => {
    await service.enableHistory(true);

    expect(service.getSettings()).toStrictEqual({ isEnabled: true });

    await service.enableHistory(false);

    expect(service.getSettings()).toStrictEqual({ isEnabled: false });
  });
});
