import { HistoryService } from "@src/background/services/History";
import { LockService } from "@src/background/services/Lock";
import { SimpleStorageService } from "@src/background/services/Storage";
import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { Operation, OperationType } from "@src/types";

jest.mock("../../Lock", (): unknown => ({
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
      type: OperationType.CREATE_IDENTITY,
      identity: {
        commitment: "1234",
        metadata: { identityStrategy: "random", account: ZERO_ADDRESS, name: "Account #1" },
      },
      createdAt: new Date().toISOString(),
    },
    {
      type: OperationType.CREATE_IDENTITY,
      identity: {
        commitment: "1234",
        metadata: { identityStrategy: "interrep", account: ZERO_ADDRESS, name: "Account #2" },
      },
      createdAt: new Date().toISOString(),
    },
    {
      type: OperationType.DELETE_IDENTITY,
      identity: {
        commitment: "1234",
        metadata: { identityStrategy: "interrep", account: ZERO_ADDRESS, name: "Account #3" },
      },
      createdAt: new Date().toISOString(),
    },
  ];
  const serializedDefaultOperations = JSON.stringify(defaultOperations);

  const defaultLockService = {
    decrypt: jest.fn(),
    encrypt: jest.fn(),
  };

  beforeEach(() => {
    defaultLockService.encrypt.mockReturnValue(serializedDefaultOperations);
    defaultLockService.decrypt.mockReturnValue(serializedDefaultOperations);

    (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: true });

    (SimpleStorageService as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(serializedDefaultOperations);
    });
  });

  afterEach(async () => {
    await service.clear();
  });

  test("should load history operations properly", async () => {
    const operations = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations without random identities", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: false });

    const operations = await service.loadOperations();

    expect(operations).toHaveLength(2);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations properly if the store is empty", async () => {
    (SimpleStorageService as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(null);
    });

    const operations = await service.loadOperations();

    expect(operations).toHaveLength(0);
    expect(service.getOperations()).toHaveLength(0);
  });

  test("should get cached operations without loading from store", () => {
    const operations = service.getOperations();

    expect(operations).toHaveLength(0);
  });

  test("should filter cached operations by type", async () => {
    await service.loadOperations();
    const operations = service.getOperations({ type: OperationType.CREATE_IDENTITY });

    expect(operations).toHaveLength(2);
  });

  test("should track operation properly", async () => {
    await service.loadOperations();
    await service.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: defaultOperations[0].identity,
    });
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(4);
  });
});
