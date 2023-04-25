/* eslint-disable @typescript-eslint/unbound-method */
import { bigintToHex } from "bigint-conversion";
import { browser } from "webextension-polyfill-ts";

import HistoryService from "@src/background/services/history";
import LockService from "@src/background/services/lock";
import NotificationService from "@src/background/services/notification";
import SimpleStorage from "@src/background/services/simpleStorage";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { CreateIdentityOptions, IdentityStrategy } from "@src/types";
import { setSelectedCommitment } from "@src/ui/ducks/identities";
import { ellipsify } from "@src/util/account";
import pushMessage from "@src/util/pushMessage";

jest.mock("@src/util/pushMessage");

jest.mock("@src/background/services/lock");

jest.mock("@src/background/services/history");

jest.mock("@src/background/services/simpleStorage");

jest.mock("@src/background/services/notification");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/zkIdentity", () => {
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

  const defaultBrowserUtils = {
    openPopup: jest.fn(),
  };

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultWindow = { id: 1 };

  beforeEach(() => {
    defaultBrowserUtils.openPopup.mockResolvedValue(defaultWindow);

    defaultLockService.encrypt.mockReturnValue(serializedDefaultIdentities);
    defaultLockService.decrypt.mockReturnValue(serializedDefaultIdentities);

    (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

    (HistoryService.getInstance as jest.Mock).mockReturnValue(defaultHistoryService);

    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

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
      const service = new ZkIdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
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
      const service = new ZkIdentityService();

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await service.unlock();

      expect(result).toBe(true);
    });
  });

  describe("set active identity", () => {
    test("should set active identity properly", async () => {
      const service = new ZkIdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
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
      const service = new ZkIdentityService();

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
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
      const service = new ZkIdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.setIdentityName({ identityCommitment: defaultIdentityCommitment, name: "New name" });

      expect(result).toBe(true);
    });

    test("should not set identity name if there is no such identity", async () => {
      const service = new ZkIdentityService();

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

      const service = new ZkIdentityService();
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
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
      const service = new ZkIdentityService();

      const result = await service.deleteIdentity({ identityCommitment: defaultIdentityCommitment });

      expect(result).toBe(false);
    });
  });

  describe("delete all identities", () => {
    test("should delete all identities properly", async () => {
      const service = new ZkIdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
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
      const service = new ZkIdentityService();

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

      const service = new ZkIdentityService();
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
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

      const service = new ZkIdentityService();
      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
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
      const service = new ZkIdentityService();

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

      const service = new ZkIdentityService();

      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
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
      const service = new ZkIdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const { commitments, identities } = await service.getIdentityCommitments();

      expect(commitments).toStrictEqual([defaultIdentityCommitment]);
      expect(identities.size).toBe(defaultIdentities.length);
    });

    test("should get identities properly", async () => {
      const service = new ZkIdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const identities = await service.getIdentities();

      expect(identities).toHaveLength(defaultIdentities.length);
    });

    test("should get identities properly with disabled random identities", async () => {
      (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: false });

      const service = new ZkIdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const identities = await service.getIdentities();

      expect(identities).toHaveLength(0);
    });

    test("should get number of identities properly", async () => {
      const service = new ZkIdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.getNumOfIdentites();

      expect(result).toBe(defaultIdentities.length);
    });
  });

  describe("create", () => {
    test("Should be able to request a create identity modal", async () => {
      const service = new ZkIdentityService();

      await service.createIdentityRequest();

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 357,
        height: 600,
      };

      expect(browser.windows.create).toBeCalledWith(defaultOptions);
    });

    test("should create a new identity properly", async () => {
      const service = new ZkIdentityService();

      const identityMessageSignature = "0x000";
      const identityStrategy: IdentityStrategy = "random";
      const identityOptions: CreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
      };

      const result = await service.createIdentity({
        strategy: identityStrategy,
        messageSignature: identityMessageSignature,
        options: identityOptions,
      });

      expect(result.status).toBe(true);
      expect(mockNotificationService.create).toBeCalledTimes(1);
      expect(result.identityCommitment).toBeDefined();
      expect(mockNotificationService.create).toBeCalledWith({
        options: {
          title: "New identity has been created.",
          message: `Identity commitment: ${ellipsify(bigintToHex(result.identityCommitment as bigint))}`,
          iconUrl: browser.runtime.getURL("/logo.png"),
          type: "basic",
        },
      });
    });

    test("should not create a new identity if there is the same identity in the store", async () => {
      const service = new ZkIdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      const identityMessageSignature = "0x000";
      const identityStrategy: IdentityStrategy = "interrep";
      const identityOptions: CreateIdentityOptions = {
        nonce: 0,
        web2Provider: "twitter",
        account: ZERO_ADDRESS,
        name: "Name",
      };

      const successResult = await service.createIdentity({
        strategy: identityStrategy,
        messageSignature: identityMessageSignature,
        options: identityOptions,
      });

      const newIdentities = JSON.stringify([
        [
          bigintToHex(successResult.identityCommitment as bigint),
          JSON.stringify({ secret: "12345", metadata: { identityStrategy: "interrep", web2Provider: "twitter" } }),
        ],
      ]);

      defaultLockService.encrypt.mockReturnValue(newIdentities);
      defaultLockService.decrypt.mockReturnValue(newIdentities);
      identityStorage.get.mockReturnValue(newIdentities);

      const failedResult = await service.createIdentity({
        strategy: identityStrategy,
        messageSignature: identityMessageSignature,
        options: identityOptions,
      });

      expect(failedResult.status).toBe(false);

      const emptyResult = await service.createIdentity({
        strategy: identityStrategy,
        messageSignature: identityMessageSignature,
        options: {},
      });

      expect(emptyResult.status).toBe(false);
    });
  });
});
