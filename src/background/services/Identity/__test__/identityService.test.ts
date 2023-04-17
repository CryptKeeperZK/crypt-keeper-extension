/* eslint-disable @typescript-eslint/unbound-method */
import { Identity } from "@semaphore-protocol/identity";
import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import { HistoryService } from "@src/background/services/History";
import { IdentityDecoraterService, IdentityService } from "@src/background/services/Identity";
import { LockService } from "@src/background/services/Lock";
import { NotificationService } from "@src/background/services/Notification";
import { SimpleStorageService } from "@src/background/services/Storage";
import { getEnabledFeatures } from "@src/config/features";
import { setSelectedCommitment } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

jest.mock("@src/util/pushMessage");

jest.mock("@src/background/services/Lock/Lock");

jest.mock("@src/background/services/History/History");

jest.mock("@src/background/services/Storage/SimpleStorage");

jest.mock("@src/background/services/Notification/Notification");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/identity", () => {
  const defaultTabs = [{ id: 1 }, { id: 2 }];
  const defaultIdentityCommitment =
    bigintToHex(15206603389158210388485662342360617949291660595274505642693885456541816400294n);
  const defaultIdentities = [
    [defaultIdentityCommitment, JSON.stringify({ secret: "1234", metadata: { identityStrategy: "random" } })],
  ];
  const serializedDefaultIdentities = JSON.stringify(defaultIdentities);
  const mockNotificationService = {
    create: jest.fn(),
  };

  const defaultLockService = {
    decrypt: jest.fn(),
    encrypt: jest.fn(),
  };

  const defaultHistoryService = {
    trackOperation: jest.fn(),
  };

  beforeEach(() => {
    defaultLockService.encrypt.mockReturnValue(serializedDefaultIdentities);
    defaultLockService.decrypt.mockReturnValue(serializedDefaultIdentities);

    (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

    (HistoryService.getInstance as jest.Mock).mockReturnValue(defaultHistoryService);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);

    (NotificationService.getInstance as jest.Mock).mockReturnValue(mockNotificationService);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("unlock", () => {
    test("should unlock properly and set active identity", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.unlock();

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(
        setSelectedCommitment({
          commitment: defaultIdentityCommitment,
        }),
      );
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setSelectedCommitment({
            commitment: defaultIdentityCommitment,
          }),
        );
      }
    });

    test("should unlock properly with empty store", async () => {
      const service = new IdentityService();

      (SimpleStorageService as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await service.unlock();

      expect(result).toBe(true);
    });
  });

  describe("set active identity", () => {
    test("should set active identity properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.setActiveIdentity({ identityCommitment: defaultIdentityCommitment });

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(
        setSelectedCommitment({
          commitment: defaultIdentityCommitment,
        }),
      );
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setSelectedCommitment({
            commitment: defaultIdentityCommitment,
          }),
        );
      }
    });

    test("should not set active identity if there is no any saved identities", async () => {
      const service = new IdentityService();

      (SimpleStorageService as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await service.setActiveIdentity({ identityCommitment: defaultIdentityCommitment });

      expect(result).toBe(false);
      expect(pushMessage).not.toBeCalled();
      expect(browser.tabs.sendMessage).not.toBeCalled();
    });
  });

  describe("set identity name", () => {
    test("should set identity name properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.setIdentityName({ identityCommitment: defaultIdentityCommitment, name: "New name" });

      expect(result).toBe(true);
    });

    test("should not set identity name if there is no such identity", async () => {
      const service = new IdentityService();

      const result = await service.setIdentityName({ identityCommitment: defaultIdentityCommitment, name: "New name" });

      expect(result).toBe(false);
    });
  });

  describe("delete identity", () => {
    test("should delete identity properly", async () => {
      defaultLockService.decrypt
        .mockReturnValueOnce(defaultIdentityCommitment)
        .mockReturnValue(serializedDefaultIdentities);

      (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

      const service = new IdentityService();
      const [identityStorage, activeIdentityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(defaultIdentityCommitment);

      const result = await service.deleteIdentity({
        identityCommitment: defaultIdentityCommitment,
      });

      expect(result).toBe(true);
    });

    test("should not delete identity if there is no any identity", async () => {
      const service = new IdentityService();

      const result = await service.deleteIdentity({ identityCommitment: defaultIdentityCommitment });

      expect(result).toBe(false);
    });
  });

  describe("delete all identities", () => {
    test("should delete all identities properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const isIdentitySet = await service.setActiveIdentity({
        identityCommitment: defaultIdentityCommitment,
      });
      const result = await service.deleteAllIdentities();

      expect(isIdentitySet).toBe(true);
      expect(result).toBe(true);
      expect(identityStorage.clear).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledTimes(3);
    });

    test("should not delete all identities if there is no any identity", async () => {
      const service = new IdentityService();

      const result = await service.deleteAllIdentities();

      expect(result).toBe(false);
    });
  });

  describe("get active identity", () => {
    test("should get active identity properly", async () => {
      defaultLockService.decrypt
        .mockReturnValueOnce(defaultIdentityCommitment)
        .mockReturnValue(serializedDefaultIdentities);
      (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

      const service = new IdentityService();
      const [identityStorage, activeIdentityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(serializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(defaultIdentityCommitment);

      const activeIdentity = await service.getActiveIdentity();

      expect(activeIdentity).toBeDefined();
    });

    test("should get active identity data properly", async () => {
      defaultLockService.decrypt
        .mockReturnValueOnce(defaultIdentityCommitment)
        .mockReturnValue(serializedDefaultIdentities);
      (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

      const service = new IdentityService();
      const [identityStorage, activeIdentityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(serializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(defaultIdentityCommitment);

      const data = await service.getActiveIdentityData();

      expect(data).toStrictEqual({
        commitment: defaultIdentityCommitment,
        web2Provider: "",
      });
    });

    test("should not get active identity if there is no any active identity", async () => {
      const service = new IdentityService();

      const identity = await service.getActiveIdentity();
      const data = await service.getActiveIdentityData();

      expect(identity).toBeUndefined();
      expect(data).toStrictEqual({
        commitment: "",
        web2Provider: "",
      });
    });

    test("should not get active identity if there is no any identity", async () => {
      defaultLockService.decrypt.mockReturnValue(defaultIdentityCommitment).mockReturnValue(undefined);
      (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

      const service = new IdentityService();

      const [identityStorage, activeIdentityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(undefined);
      activeIdentityStorage.get.mockReturnValue(defaultIdentityCommitment);

      const result = await service.getActiveIdentity();

      expect(result).toBeUndefined();
    });
  });

  describe("get identities", () => {
    test("should get identity commitments properly", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const { commitments, identities } = await service.getIdentityCommitments();

      expect(commitments).toStrictEqual([defaultIdentityCommitment]);
      expect(identities.size).toBe(defaultIdentities.length);
    });

    test("should get identities properly", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const identities = await service.getIdentities();

      expect(identities).toHaveLength(defaultIdentities.length);
    });

    test("should get identities properly with disabled random identities", async () => {
      (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: false });

      const service = new IdentityService();

      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const identities = await service.getIdentities();

      expect(identities).toHaveLength(0);
    });

    test("should get number of identities properly", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.getNumOfIdentites();

      expect(result).toBe(defaultIdentities.length);
    });
  });

  describe("insert", () => {
    test("should insert identity properly", async () => {
      const service = new IdentityService();
      const identity = new Identity();
      const identityCommitment = bigintToHex(identity.getCommitment());

      const result = await service.insert(
        new IdentityDecoraterService(identity, {
          account: defaultIdentityCommitment,
          name: "Name",
          identityStrategy: "random",
        }),
      );

      expect(result).toBe(true);
      expect(mockNotificationService.create).toBeCalledTimes(1);
      expect(mockNotificationService.create).toBeCalledWith({
        options: {
          title: "New identity has been created.",
          message: `Identity commitment: ${ellipsify(identityCommitment)}`,
          iconUrl: browser.runtime.getURL("/logo.png"),
          type: "basic",
        },
      });
    });

    test("should not insert identity if there is the same identity in the store", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorageService as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.insert(
        new IdentityDecoraterService({ getCommitment: () => defaultIdentityCommitment } as unknown as Identity, {
          account: defaultIdentityCommitment,
          name: "Name",
          identityStrategy: "random",
        }),
      );

      expect(result).toBe(false);
    });
  });
});
