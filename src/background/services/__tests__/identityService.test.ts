import { browser } from "webextension-polyfill-ts";

import { ZERO_ADDRESS } from "@src/config/const";
import { setIdentities, setSelected } from "@src/ui/ducks/identities";
import pushMessage from "@src/util/pushMessage";

import IdentityService from "../identity";
import LockService from "../lock";
import SimpleStorage from "../simpleStorage";
import ZkIdentityDecorater from "@src/background/identityDecorater";
import { Identity } from "@semaphore-protocol/identity";

jest.mock("@src/util/pushMessage");

jest.mock("../lock", (): unknown => ({
  decrypt: jest.fn(),
  encrypt: jest.fn(),
}));

jest.mock("../simpleStorage");

describe("background/services/identity", () => {
  const service = new IdentityService();
  const defaultTabs = [{ id: 1 }, { id: 2 }];
  const defaultIdentityCommitment = ZERO_ADDRESS;
  const defaultIdentities = [[defaultIdentityCommitment, JSON.stringify({ secret: "1234", metadata: {} })]];
  const serializedDefaultIdentities = JSON.stringify(defaultIdentities);

  beforeEach(() => {
    (LockService.decrypt as jest.Mock).mockResolvedValue(serializedDefaultIdentities);

    (LockService.encrypt as jest.Mock).mockResolvedValue(serializedDefaultIdentities);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("unlock", () => {
    test("should unlock properly and set active identity", async () => {
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.unlock();

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(setSelected(ZERO_ADDRESS));
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setSelected(ZERO_ADDRESS),
        );
      }
    });

    test("should unlock properly with empty store", async () => {
      const service = new IdentityService();

      for (const instance of (SimpleStorage as jest.Mock).mock.instances) {
        instance.get.mockReturnValue(undefined);
      }

      const result = await service.unlock();

      expect(result).toBe(true);
    });
  });

  describe("set active identity", () => {
    test("should set active identity properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.setActiveIdentity(ZERO_ADDRESS);

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(setSelected(ZERO_ADDRESS));
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setSelected(ZERO_ADDRESS),
        );
      }
    });

    test("should not set active identity if there is no any saved identities", async () => {
      const service = new IdentityService();

      for (const instance of (SimpleStorage as jest.Mock).mock.instances) {
        instance.get.mockReturnValue(undefined);
      }

      const result = await service.setActiveIdentity(ZERO_ADDRESS);

      expect(result).toBe(false);
      expect(pushMessage).not.toBeCalled();
      expect(browser.tabs.sendMessage).not.toBeCalled();
    });
  });

  describe("set identity name", () => {
    test("should set identity name properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.setIdentityName({ identityCommitment: ZERO_ADDRESS, name: "New name" });

      expect(result).toBe(true);
    });

    test("should not set identity name if there is no such identity", async () => {
      const service = new IdentityService();

      const result = await service.setIdentityName({ identityCommitment: ZERO_ADDRESS, name: "New name" });

      expect(result).toBe(false);
    });
  });

  describe("delete identity", () => {
    test("should delete identity properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.deleteIdentity({ identityCommitment: ZERO_ADDRESS });

      expect(result).toBe(true);
    });

    test("should not delete identity if there is no any identity", async () => {
      const service = new IdentityService();

      const result = await service.deleteIdentity({ identityCommitment: ZERO_ADDRESS });

      expect(result).toBe(false);
    });
  });

  describe("delete all identities", () => {
    test("should delete all identities properly", async () => {
      const service = new IdentityService();
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const isIdentitySet = await service.setActiveIdentity(ZERO_ADDRESS);
      const result = await service.deleteAllIdentities();

      expect(isIdentitySet).toBe(true);
      expect(result).toBe(true);
      expect(identityStorage.clear).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledTimes(3);
      expect(pushMessage).toHaveBeenNthCalledWith(1, setSelected(ZERO_ADDRESS));
      expect(pushMessage).toHaveBeenNthCalledWith(2, setSelected(""));
      expect(pushMessage).toHaveBeenNthCalledWith(3, setIdentities([]));
    });

    test("should not delete all identities if there is no any identity", async () => {
      const service = new IdentityService();

      const result = await service.deleteAllIdentities();

      expect(result).toBe(false);
    });
  });

  describe("get active identity", () => {
    test("should get active identity properly", async () => {
      const service = new IdentityService();

      (LockService.decrypt as jest.Mock)
        .mockResolvedValueOnce(ZERO_ADDRESS)
        .mockResolvedValue(serializedDefaultIdentities);

      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);
      activeIdentityStorage.get.mockReturnValue(ZERO_ADDRESS);

      const result = await service.getActiveIdentity();

      expect(result).toBeDefined();
    });

    test("should not get active identity if there is no any active identity", async () => {
      const service = new IdentityService();

      const result = await service.getActiveIdentity();

      expect(result).toBeUndefined();
    });

    test("should not get active identity if there is no any identity", async () => {
      const service = new IdentityService();

      (LockService.decrypt as jest.Mock).mockResolvedValueOnce(ZERO_ADDRESS).mockResolvedValue(undefined);

      const [identityStorage, activeIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(undefined);
      activeIdentityStorage.get.mockReturnValue(ZERO_ADDRESS);

      const result = await service.getActiveIdentity();

      expect(result).toBeUndefined();
    });
  });

  describe("get identities", () => {
    test("should get identity commitments properly", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const { commitments, identities } = await service.getIdentityCommitments();

      expect(commitments).toStrictEqual([ZERO_ADDRESS]);
      expect(identities.size).toBe(defaultIdentities.length);
    });

    test("should get identities properly", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const identities = await service.getIdentities();

      expect(identities).toHaveLength(defaultIdentities.length);
    });

    test("should get number of identities properly", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.getNumOfIdentites();

      expect(result).toBe(defaultIdentities.length);
    });
  });

  describe("insert", () => {
    test("should insert identity properly", async () => {
      const service = new IdentityService();

      const result = await service.insert(
        new ZkIdentityDecorater(new Identity(), {
          account: ZERO_ADDRESS,
          name: "Name",
          identityStrategy: "random",
        }),
      );

      expect(result).toBe(true);
    });

    test("should not insert identity if there is the same identity in the store", async () => {
      const service = new IdentityService();

      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances;
      identityStorage.get.mockReturnValue(serializedDefaultIdentities);

      const result = await service.insert(
        new ZkIdentityDecorater({ getCommitment: () => defaultIdentityCommitment } as unknown as Identity, {
          account: ZERO_ADDRESS,
          name: "Name",
          identityStrategy: "random",
        }),
      );

      expect(result).toBe(false);
    });
  });
});
