import SimpleStorage from "@src/background/services/storage";
import { mockDefaultIdentity } from "@src/config/mock/zk";

import type { IConnectArgs, IZkMetadata } from "@cryptkeeperzk/types";

import ConnectionService from "..";

const mockDefaultHosts = [mockDefaultIdentity.metadata.urlOrigin];
const mockSerializedConnections = JSON.stringify([
  [
    mockDefaultHosts[0],
    {
      name: mockDefaultIdentity.metadata.name,
      urlOrigin: mockDefaultHosts[0],
      commitment: mockDefaultIdentity.commitment,
    },
  ],
]);

jest.mock("@src/background/services/crypto", (): unknown => ({
  ...jest.requireActual("@src/background/services/crypto"),
  getInstance: jest.fn(() => ({
    encrypt: jest.fn((arg: string) => arg),
    decrypt: jest.fn(() => mockSerializedConnections),
    generateEncryptedHmac: jest.fn(() => "encrypted"),
    getAuthenticBackup: jest.fn((encrypted: string | Record<string, string>) => encrypted),
  })),
}));

jest.mock("@src/background/services/zkIdentity", (): unknown => ({
  getInstance: jest.fn(() => ({
    getIdentity: jest.fn((arg: string) => (arg !== "unknown" ? Promise.resolve(mockDefaultIdentity) : undefined)),
  })),
}));

jest.mock("@src/background/services/storage");

interface MockStorage {
  get: jest.Mock;
  set: jest.Mock;
  clear: jest.Mock;
}

describe("background/services/connection", () => {
  const connectionService = ConnectionService.getInstance();

  const defaultMetadata: IZkMetadata = { urlOrigin: mockDefaultHosts[0] };

  beforeEach(() => {
    process.env.NODE_ENV = "test";

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(mockSerializedConnections);
      instance.set.mockResolvedValue(undefined);
      instance.clear.mockResolvedValue(undefined);
    });
  });

  afterEach(async () => {
    process.env.NODE_ENV = "test";
    await connectionService.lock();

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockClear();
      instance.set.mockClear();
      instance.clear.mockClear();
    });
  });

  describe("unlock", () => {
    test("should unlock properly without stored data", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockResolvedValue(undefined);
      });

      const result = await connectionService.unlock();

      expect(result).toBe(true);
    });

    test("should unlock properly", async () => {
      const result = await connectionService.unlock();

      expect(result).toBe(true);
    });

    test("should await unlock properly", async () => {
      connectionService.awaitUnlock();
      const isUnlocked = await connectionService.unlock();
      const isUnlockCompleted = connectionService.onUnlocked();

      expect(isUnlocked).toBe(true);
      expect(isUnlockCompleted).toBe(true);
    });

    test("should not unlock twice", async () => {
      const isUnlockedFirst = await connectionService.unlock();
      const isUnlockedSecond = await connectionService.unlock();

      expect(isUnlockedFirst).toBe(true);
      expect(isUnlockedSecond).toBe(true);
      expect(await connectionService.awaitUnlock()).toBeUndefined();
    });
  });

  describe("connect", () => {
    const defaultArgs: IConnectArgs = {
      commitment: mockDefaultIdentity.commitment,
    };

    test("should connect identity properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.connect(defaultArgs, defaultMetadata);
      const connections = connectionService.getConnections();

      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith(mockSerializedConnections);
      expect(connections.size).toBe(1);
    });

    test("should throw error if there is no url origin", async () => {
      await expect(connectionService.connect(defaultArgs, { urlOrigin: "" })).rejects.toThrowError(
        "CryptKeeper: origin is not provided",
      );
    });

    test("should throw error if there is no idenity found", async () => {
      await expect(connectionService.connect({ commitment: "unknown" }, defaultMetadata)).rejects.toThrowError(
        "CryptKeeper: identity is not found",
      );
    });
  });

  describe("disconnect", () => {
    beforeEach(async () => {
      await connectionService.unlock();
    });

    test("should disconnect identity properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.disconnect({}, defaultMetadata);
      const connections = connectionService.getConnections();

      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith(JSON.stringify([]));
      expect(connections.size).toBe(0);
    });

    test("should throw error if there is no url origin", async () => {
      await expect(connectionService.disconnect({}, { urlOrigin: "" })).rejects.toThrowError(
        "CryptKeeper: origin is not provided",
      );
    });

    test("should throw error if origin is not connected", async () => {
      await expect(connectionService.disconnect({}, { urlOrigin: "unknown" })).rejects.toThrowError(
        "CryptKeeper: origin is not connected",
      );
    });
  });

  describe("checks", () => {
    beforeEach(async () => {
      await connectionService.unlock();
    });

    afterEach(async () => {
      await connectionService.lock();
    });

    test("should throw error if there is no url origin", () => {
      expect(() => connectionService.isOriginConnected({}, { urlOrigin: "" })).toThrowError(
        "CryptKeeper: origin is not provided",
      );
    });

    test("should throw error if there is no connection for url origin", () => {
      expect(() => connectionService.isOriginConnected({}, { urlOrigin: "unknown" })).toThrowError(
        "CryptKeeper: origin is not connected",
      );
    });

    test("should return payload for connected url origin", () => {
      const result = connectionService.isOriginConnected({}, defaultMetadata);

      expect(result).toStrictEqual({});
    });
  });

  describe("backup", () => {
    test("should download encrypted connections", async () => {
      const result = await connectionService.downloadEncryptedStorage("password");

      expect(result).toBeDefined();
    });

    test("should not download encrypted connections if storage is empty", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await connectionService.downloadEncryptedStorage("password");

      expect(result).toBeNull();
    });

    test("should upload encrypted connections", async () => {
      await connectionService.uploadEncryptedStorage("encrypted", "password");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(1);
      });
    });

    test("should not upload encrypted connections if there is no data", async () => {
      await connectionService.uploadEncryptedStorage("", "");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(0);
      });
    });

    test("should throw error when trying upload incorrect backup", async () => {
      await expect(connectionService.uploadEncryptedStorage({}, "password")).rejects.toThrow(
        "Incorrect backup format for connections",
      );
    });

    test("should download storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.downloadStorage();

      expect(storage.get).toBeCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.restoreStorage("storage");

      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(connectionService.restoreStorage({})).rejects.toThrow("Incorrect restore format for connections");
    });
  });
});
