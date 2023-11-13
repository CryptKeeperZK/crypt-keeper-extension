/* eslint-disable @typescript-eslint/unbound-method */
import browser from "webextension-polyfill";

import SimpleStorage from "@src/background/services/storage";
import { defaultMnemonic } from "@src/config/mock/wallet";
import { InitializationStep } from "@src/types";
import { setStatus } from "@src/ui/ducks/app";
import pushMessage from "@src/util/pushMessage";

import LockerService from "..";

const defaultPassword = "password";
const passwordChecker = "Password is correct";

jest.mock("@src/background/services/crypto", (): unknown => ({
  ...jest.requireActual("@src/background/services/crypto"),
  getInstance: jest.fn(() => ({
    encrypt: jest.fn(() => defaultPassword),
    decrypt: jest.fn(() => passwordChecker),
    setPassword: jest.fn(),
    setMnemonic: jest.fn(),
    isAuthenticPassword: jest.fn(() => true),
    clear: jest.fn(),
    generateEncryptedHmac: jest.fn(() => "encrypted"),
    getAuthenticBackup: jest.fn((encrypted: string | Record<string, string>) => encrypted),
  })),
}));

jest.mock("@src/background/services/misc", (): unknown => ({
  ...jest.requireActual("@src/background/services/misc"),
  getInstance: jest.fn(() => ({
    getInitialization: jest.fn(() => InitializationStep.MNEMONIC),
    setInitialization: jest.fn(),
  })),
}));

jest.mock("@src/background/services/wallet", (): unknown => ({
  ...jest.requireActual("@src/background/services/wallet"),
  getInstance: jest.fn(() => ({
    getMnemonic: jest.fn(() => Promise.resolve(defaultMnemonic)),
    changeMnemonicPassword: jest.fn(),
  })),
}));

jest.mock("@src/background/services/history", (): unknown => ({
  getInstance: jest.fn(() => ({
    loadSettings: jest.fn(),
    trackOperation: jest.fn(),
  })),
}));

jest.mock("@src/background/services/notification", (): unknown => ({
  getInstance: jest.fn(() => ({
    create: jest.fn(),
  })),
}));

jest.mock("@src/util/pushMessage");

jest.mock("@src/background/services/storage");

interface MockStorage {
  get: jest.Mock;
  set: jest.Mock;
}

describe("background/services/locker", () => {
  const lockService = LockerService.getInstance();
  const defaultTabs = [{ id: "1" }, { id: "2" }, { id: "3" }];

  beforeEach(async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    await lockService.lock();

    (browser.tabs.sendMessage as jest.Mock).mockClear();
    (pushMessage as jest.Mock).mockClear();
    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(defaultPassword);
    });
  });

  describe("ensure", () => {
    test("should return false if there is no password or it's not unlocked", () => {
      expect(lockService.ensure({})).toBe(false);
    });

    test("should return args from ensure call properly", async () => {
      await lockService.unlock(defaultPassword);

      const result = await lockService.ensure({ args: [1, 2, 3] });

      expect(result).toStrictEqual({ args: [1, 2, 3] });
    });
  });

  describe("unlock", () => {
    test("should setup password and unlock properly", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockResolvedValueOnce(undefined).mockResolvedValue(defaultPassword);
      });

      await lockService.setupPassword(defaultPassword);
      const status = await lockService.getStatus();

      expect(status).toStrictEqual({
        isInitialized: true,
        isMnemonicGenerated: true,
        isUnlocked: true,
      });
    });

    test("should throw error if password is already setup", async () => {
      await expect(lockService.setupPassword(defaultPassword)).rejects.toThrow("Password is already initialized");
    });

    test("should reset password and unlock properly", async () => {
      const [passwordStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      passwordStorage.set.mockClear();

      await lockService.resetPassword({ mnemonic: defaultMnemonic, password: defaultPassword });
      const status = await lockService.getStatus();

      expect(passwordStorage.set).toHaveBeenCalledTimes(1);
      expect(status).toStrictEqual({
        isInitialized: true,
        isMnemonicGenerated: true,
        isUnlocked: true,
      });
    });

    test("should check password properly", () => {
      const result = lockService.checkPassword({ password: defaultPassword });

      expect(result).toBe(true);
    });

    test("should unlock properly", async () => {
      const isUnlocked = await lockService.unlock(defaultPassword);
      const status = await lockService.getStatus();

      expect(isUnlocked).toBe(true);
      expect(status).toStrictEqual({
        isInitialized: true,
        isUnlocked: true,
        isMnemonicGenerated: true,
      });

      expect(pushMessage).toHaveBeenCalledTimes(1);
      expect(pushMessage).toHaveBeenCalledWith(setStatus(status));
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(index + 1, defaultTabs[index].id, setStatus(status));
      }
    });

    test("should await unlock properly", async () => {
      lockService.awaitUnlock();
      const isUnlocked = await lockService.unlock(defaultPassword);
      const isUnlockCompleted = lockService.onUnlocked();

      expect(isUnlocked).toBe(true);
      expect(isUnlockCompleted).toBe(true);
    });

    test("should not unlock twice", async () => {
      const isUnlockedFirst = await lockService.unlock(defaultPassword);
      const isUnlockedSecond = await lockService.unlock("wrong");

      expect(isUnlockedFirst).toBe(true);
      expect(isUnlockedSecond).toBe(true);
      expect(await lockService.awaitUnlock()).toBeUndefined();
    });

    test("should not unlock if there is no cipher text", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockResolvedValue(undefined);
      });

      await expect(lockService.unlock(defaultPassword)).rejects.toThrowError(
        "Something badly gone wrong (reinstallation probably required)",
      );
    });

    test("should not unlock if there is wrong password", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValue(defaultPassword);
      });

      await expect(lockService.unlock("wrong")).rejects.toThrowError("Incorrect password");
    });
  });

  describe("backup", () => {
    test("should download encrypted password storage", async () => {
      const [{ get: mockGet }] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      mockGet.mockClear();

      const result = await lockService.downloadEncryptedStorage(defaultPassword);

      expect(result).toBeDefined();

      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    test("should not download encrypted password storage if storage is empty", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockResolvedValue(undefined);
      });

      const result = await lockService.downloadEncryptedStorage(defaultPassword);

      expect(result).toBeNull();
    });

    test("should not upload encrypted password storage if existing user", async () => {
      const [{ set: mockSet }] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      mockSet.mockClear();

      await lockService.uploadEncryptedStorage("encrypted", defaultPassword);

      expect(mockSet).toHaveBeenCalledTimes(0);
    });

    test("should upload encrypted password storage if new user", async () => {
      const [{ set: mockSet }] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      mockSet.mockClear();

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get
          .mockResolvedValueOnce(undefined)
          .mockResolvedValueOnce(undefined)
          .mockResolvedValue(defaultPassword);
      });

      await lockService.uploadEncryptedStorage("encrypted", defaultPassword);

      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    test("should throw error when trying upload incorrect backup", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockResolvedValue(undefined);
      });

      await expect(lockService.uploadEncryptedStorage({}, "password")).rejects.toThrow(
        "Incorrect backup format for password",
      );
    });

    test("should download storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      storage.get.mockClear();

      await lockService.downloadStorage();

      expect(storage.get).toHaveBeenCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      storage.set.mockClear();

      await lockService.restoreStorage("storage");

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(lockService.restoreStorage({})).rejects.toThrow("Incorrect restore format for password");
    });
  });
});
