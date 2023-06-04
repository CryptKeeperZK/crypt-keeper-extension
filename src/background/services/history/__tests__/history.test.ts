import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { Operation, OperationType } from "@src/types";

import HistoryService from "..";
import SimpleStorage from "../../storage";

const mockDefaultOperations: Operation[] = [
  {
    id: "1",
    type: OperationType.CREATE_IDENTITY,
    identity: {
      commitment: "1234",
      metadata: { identityStrategy: "random", account: ZERO_ADDRESS, name: "Account #1",         groups: []
    },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: OperationType.CREATE_IDENTITY,
    identity: {
      commitment: "1234",
      metadata: { identityStrategy: "interrep", account: ZERO_ADDRESS, name: "Account #2",         groups: []
    },
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    type: OperationType.DELETE_IDENTITY,
    identity: {
      commitment: "1234",
      metadata: { identityStrategy: "interrep", account: ZERO_ADDRESS, name: "Account #3",         groups: []
    },
    },
    createdAt: new Date().toISOString(),
  },
];
const mockSerializedDefaultOperations = JSON.stringify(mockDefaultOperations);

const mockDefaultSettings = { isEnabled: true };
const mockSerializedDefaultSettings = JSON.stringify(mockDefaultSettings);

jest.mock("@src/background/services/notification", (): unknown => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      create: jest.fn(),
    })),
  },
}));

jest.mock("@src/background/services/lock", (): unknown => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      encrypt: jest.fn(() => Promise.resolve(mockSerializedDefaultOperations)),
      decrypt: jest.fn(() => Promise.resolve(mockSerializedDefaultOperations)),
    })),
  },
}));

jest.mock("@src/background/services/storage");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/history", () => {
  const service = HistoryService.getInstance();

  beforeEach(() => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: true });
  });

  afterEach(async () => {
    await service.clear();
  });

  test("should load history operations properly", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(mockSerializedDefaultSettings);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(settings).toStrictEqual(mockDefaultSettings);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations with empty history settings", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(null);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(settings).toStrictEqual(mockDefaultSettings);
    expect(service.getOperations()).toStrictEqual(operations);
    expect(service.getSettings()).toStrictEqual(mockDefaultSettings);
  });

  test("should load history operations without interrep identities", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: false });

    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(mockSerializedDefaultSettings);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(1);
    expect(settings).toStrictEqual(mockDefaultSettings);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations if history is disabled", async () => {
    const [, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    settingsStore.get.mockResolvedValueOnce(JSON.stringify({ ...mockDefaultSettings, isEnabled: false }));

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(settings).toStrictEqual({ isEnabled: false });
    expect(service.getOperations()).toHaveLength(3);
  });

  test("should load history operations properly if the store is empty", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(null);
    settingsStore.get.mockResolvedValueOnce(mockSerializedDefaultSettings);

    const { operations, settings } = await service.loadOperations();

    expect(operations).toHaveLength(0);
    expect(settings).toStrictEqual(mockDefaultSettings);
    expect(service.getOperations()).toHaveLength(0);
  });

  test("should get cached operations without loading from store", () => {
    const operations = service.getOperations();

    expect(operations).toHaveLength(0);
  });

  test("should filter cached operations by type", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(mockSerializedDefaultSettings);

    await service.loadOperations();
    const operations = service.getOperations({ type: OperationType.CREATE_IDENTITY });

    expect(operations).toHaveLength(2);
  });

  test("should track operation properly", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(mockSerializedDefaultSettings);

    await service.loadOperations();
    await service.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: mockDefaultOperations[0].identity,
    });
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(4);
  });

  test("should not track operation if history is disabled", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(JSON.stringify({ ...mockDefaultSettings, isEnabled: false }));

    await service.loadOperations();
    await service.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: mockDefaultOperations[0].identity,
    });
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(3);
  });

  test("should remove operation properly", async () => {
    const [historyStore, settingsStore] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
    historyStore.get.mockResolvedValue(mockSerializedDefaultOperations);
    settingsStore.get.mockResolvedValueOnce(mockSerializedDefaultSettings);

    await service.loadOperations();
    await service.removeOperation(mockDefaultOperations[0].id);
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
