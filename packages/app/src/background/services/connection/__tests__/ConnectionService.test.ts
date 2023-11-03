/* eslint-disable @typescript-eslint/unbound-method */
import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import SimpleStorage from "@src/background/services/storage";
import { mockDefaultConnection, mockDefaultIdentity } from "@src/config/mock/zk";

import type { IConnectArgs, IZkMetadata } from "@cryptkeeperzk/types";

import ConnectionService from "..";

const mockSerializedConnections = JSON.stringify([
  [
    "http://localhost:3000",
    {
      name: mockDefaultIdentity.metadata.name,
      commitment: mockDefaultIdentity.commitment,
      urlOrigin: "http://localhost:3000",
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
    getIdentity: jest.fn((arg: string) => (arg !== "unknown" ? mockDefaultIdentity : undefined)),
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

  const defaultMetadata: IZkMetadata = { urlOrigin: "http://localhost:3000" };

  const defaultTabs = [{ id: 1, url: defaultMetadata.urlOrigin }, { id: 2, url: defaultMetadata.urlOrigin }, { id: 3 }];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  beforeEach(() => {
    process.env.NODE_ENV = "test";

    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

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

    (browser.tabs.create as jest.Mock).mockClear();

    (browser.tabs.query as jest.Mock).mockClear();

    (browser.tabs.sendMessage as jest.Mock).mockClear();

    (browser.windows.create as jest.Mock).mockClear();
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

    beforeEach(async () => {
      await connectionService.unlock();
    });

    test("should request connection properly", async () => {
      await connectionService.connectRequest({}, defaultMetadata);

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });
      expect(browser.windows.create).toHaveBeenCalledTimes(1);
      expect(browser.windows.create).toHaveBeenCalledWith(defaultOptions);
    });

    test("should connect properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.connect(defaultArgs, defaultMetadata);
      const connections = connectionService.getConnections();
      const identity = connectionService.getConnectedIdentity(defaultMetadata.urlOrigin!);

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith(mockSerializedConnections);
      expect(Object.entries(connections)).toHaveLength(1);
      expect(identity?.metadata.name).toBe(mockDefaultIdentity.metadata.name);
    });

    test("should throw error if there is no url origin", async () => {
      await expect(connectionService.connect(defaultArgs, { urlOrigin: "" })).rejects.toThrow(
        "CryptKeeper: origin is not provided",
      );
    });

    test("should throw error if there is no idenity found", async () => {
      await expect(connectionService.connect({ commitment: "unknown" }, defaultMetadata)).rejects.toThrow(
        "CryptKeeper: identity is not found",
      );
    });
  });

  describe("disconnect", () => {
    beforeEach(async () => {
      await connectionService.unlock();
    });

    test("should disconnect properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.disconnect({}, defaultMetadata);
      const connections = connectionService.getConnections();
      const identity = connectionService.getConnectedIdentity(defaultMetadata.urlOrigin!);

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith(JSON.stringify([]));
      expect(Object.entries(connections)).toHaveLength(0);
      expect(identity).toBeUndefined();
    });

    test("should disconnect with commitment properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.disconnect(
        { identityCommitment: mockDefaultConnection.commitment },
        { urlOrigin: undefined },
      );
      const connections = connectionService.getConnections();
      const identity = connectionService.getConnectedIdentity(defaultMetadata.urlOrigin!);

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith(JSON.stringify([]));
      expect(Object.entries(connections)).toHaveLength(0);
      expect(identity).toBeUndefined();
    });

    test("should return false if there is no url origin", async () => {
      await expect(connectionService.disconnect({}, { urlOrigin: "" })).resolves.toBe(false);
    });
  });

  describe("clear", () => {
    beforeEach(async () => {
      await connectionService.unlock();
    });

    test("should clear storage properly", async () => {
      await connectionService.clear();
      const connections = connectionService.getConnections();

      expect(Object.entries(connections)).toHaveLength(0);
    });
  });

  describe("reveal commitment", () => {
    beforeEach(async () => {
      await connectionService.unlock();
    });

    test("should request reveal connected identity commitment", async () => {
      await connectionService.revealConnectedIdentityCommitmentRequest({}, defaultMetadata);

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });
      expect(browser.windows.create).toHaveBeenCalledWith(defaultOptions);
    });

    test("should reveal connected identity commitment", async () => {
      await connectionService.revealConnectedIdentityCommitment({}, defaultMetadata);

      expect(browser.tabs.query).toHaveBeenCalledWith({});
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(2);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(1, defaultTabs[0].id, {
        type: EventName.REVEAL_COMMITMENT,
        payload: { commitment: mockDefaultConnection.commitment },
      });
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(2, defaultTabs[1].id, {
        type: EventName.REVEAL_COMMITMENT,
        payload: { commitment: mockDefaultConnection.commitment },
      });
    });

    test("should not reveal identity commitment if there is not connection", async () => {
      await expect(connectionService.revealConnectedIdentityCommitment({}, { urlOrigin: "unknown" })).rejects.toThrow(
        "CryptKeeper: No connected identity found",
      );
    });
  });

  describe("checks", () => {
    beforeEach(async () => {
      await connectionService.unlock();
    });

    test("should throw error if there is no url origin", () => {
      expect(() => connectionService.isOriginConnected({}, { urlOrigin: "" })).toThrow(
        "CryptKeeper: origin is not provided",
      );
    });

    test("should throw error if there is no connection for url origin", () => {
      expect(() => connectionService.isOriginConnected({}, { urlOrigin: "unknown" })).toThrow(
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
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.uploadEncryptedStorage("encrypted", "password");

      expect(storage.set).toHaveBeenCalledTimes(1);
    });

    test("should not upload encrypted connections if there is no data", async () => {
      await connectionService.uploadEncryptedStorage("", "");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toHaveBeenCalledTimes(0);
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

      expect(storage.get).toHaveBeenCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await connectionService.restoreStorage("storage");

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(connectionService.restoreStorage({})).rejects.toThrow("Incorrect restore format for connections");
    });
  });
});
