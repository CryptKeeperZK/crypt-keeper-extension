/* eslint-disable @typescript-eslint/unbound-method */
import { createNewIdentity } from "@cryptkeeperzk/zk";
import { bigintToHex } from "bigint-conversion";
import browser from "webextension-polyfill";

import SimpleStorage from "@src/background/services/storage";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { ZERO_ADDRESS } from "@src/config/const";
import { getEnabledFeatures } from "@src/config/features";
import { CreateIdentityOptions, EWallet, IdentityStrategy } from "@src/types";
import { setConnectedIdentity, setIdentities } from "@src/ui/ducks/identities";
import pushMessage from "@src/util/pushMessage";

const mockDefaultIdentityCommitment =
  bigintToHex(15206603389158210388485662342360617949291660595274505642693885456541816400294n);
const mockDefaultIdentity = {
  secret: "1234",
  metadata: {
    account: ZERO_ADDRESS,
    groups: [],
    name: "Account",
    web2Provider: undefined,
    identityStrategy: "interrep" as const,
    host: "http://localhost:3000",
  },
};
const mockDefaultIdentities = [[mockDefaultIdentityCommitment, JSON.stringify(mockDefaultIdentity)]];
const mockSerializedDefaultIdentities = JSON.stringify(mockDefaultIdentities);

jest.mock("@src/background/services/crypto", (): unknown => ({
  ...jest.requireActual("@src/background/services/crypto"),
  getInstance: jest.fn(() => ({
    encrypt: jest.fn(() => mockSerializedDefaultIdentities),
    decrypt: jest.fn((value) =>
      value === mockDefaultIdentityCommitment.toString()
        ? mockDefaultIdentityCommitment.toString()
        : mockSerializedDefaultIdentities,
    ),
    generateEncryptedHmac: jest.fn(() => "encrypted"),
    getAuthenticCiphertext: jest.fn(() => "encrypted"),
  })),
}));

jest.mock("@src/background/services/history", (): unknown => ({
  getInstance: jest.fn(() => ({
    trackOperation: jest.fn(),
  })),
}));

jest.mock("@src/background/services/notification", (): unknown => ({
  getInstance: jest.fn(() => ({
    create: jest.fn(),
  })),
}));

jest.mock("@src/background/services/wallet", (): unknown => ({
  getInstance: jest.fn(() => ({
    signMessage: jest.fn(() => Promise.resolve("ck-signature")),
  })),
}));

jest.mock("@src/background/services/storage");

jest.mock("@src/util/pushMessage");

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  ...jest.requireActual("@cryptkeeperzk/zk"),
  createNewIdentity: jest.fn(),
}));

interface MockStorage {
  get: jest.Mock;
  set: jest.Mock;
  clear: jest.Mock;
}

describe("background/services/zkIdentity", () => {
  const zkIdentityService = ZkIdentityService.getInstance();

  const defaultTabs = [{ id: 1 }, { id: 2 }];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultNewIdentity = {
    serialize: () => JSON.stringify({ secret: "1234", metadata: { identityStrategy: "random" } }),
    genIdentityCommitment: () => "commitment",
    metadata: { host: "http://localhost:3000" },
  };

  beforeEach(() => {
    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: true });

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockReturnValue(mockSerializedDefaultIdentities);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
    });

    (createNewIdentity as jest.Mock).mockReturnValue(defaultNewIdentity);
  });

  afterEach(() => {
    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockClear();
      instance.set.mockClear();
      instance.clear.mockClear();
    });

    (pushMessage as jest.Mock).mockClear();

    (browser.tabs.sendMessage as jest.Mock).mockClear();
  });

  describe("unlock", () => {
    test("should unlock properly and set connected identity", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockResolvedValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockResolvedValue(mockDefaultIdentityCommitment);

      const result = await zkIdentityService.unlock();

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
      expect(pushMessage).toBeCalledWith(
        setConnectedIdentity({
          commitment: mockDefaultIdentityCommitment,
        }),
      );
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setConnectedIdentity({
            commitment: mockDefaultIdentityCommitment,
          }),
        );
      }
    });

    test("should unlock properly with empty store", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await zkIdentityService.unlock();

      expect(result).toBe(true);
    });
  });

  describe("set connected identity", () => {
    test("should set connected identity properly", async () => {
      const result = await zkIdentityService.connectIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
        host: "http://localhost:3000",
      });

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(2);
      expect(pushMessage).toHaveBeenNthCalledWith(
        1,
        setConnectedIdentity({
          commitment: mockDefaultIdentityCommitment,
          host: "http://localhost:3000",
          web2Provider: undefined,
        }),
      );
      expect(pushMessage).toHaveBeenNthCalledWith(
        2,
        setIdentities([{ commitment: mockDefaultIdentityCommitment, metadata: mockDefaultIdentity.metadata }]),
      );
      expect(browser.tabs.sendMessage).toBeCalledTimes(defaultTabs.length);

      for (let index = 0; index < defaultTabs.length; index += 1) {
        expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(
          index + 1,
          defaultTabs[index].id,
          setConnectedIdentity({
            commitment: mockDefaultIdentityCommitment,
            host: "http://localhost:3000",
            web2Provider: undefined,
          }),
        );
      }
    });

    test("should not set connected identity if there is no any saved identities", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await zkIdentityService.connectIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
        host: "http://localhost:3000",
      });

      expect(result).toBe(false);
      expect(pushMessage).not.toBeCalled();
      expect(browser.tabs.sendMessage).not.toBeCalled();
    });
  });

  describe("set identity name", () => {
    test("should set identity name properly", async () => {
      const result = await zkIdentityService.setIdentityName({
        identityCommitment: mockDefaultIdentityCommitment,
        name: "New name",
      });

      expect(result).toBe(true);
    });

    test("should not set identity name if there is no such identity", async () => {
      const result = await zkIdentityService.setIdentityName({
        identityCommitment: "unknown",
        name: "New name",
      });

      expect(result).toBe(false);
    });
  });

  describe("set identity host", () => {
    test("should set identity host properly", async () => {
      const result = await zkIdentityService.setIdentityHost({
        identityCommitment: mockDefaultIdentityCommitment,
        host: "http://localhost:3000",
      });

      expect(result).toBe(true);
    });

    test("should not set identity host if there is no such identity", async () => {
      const result = await zkIdentityService.setIdentityHost({
        identityCommitment: "unknown",
        host: "http://localhost:3000",
      });

      expect(result).toBe(false);
    });
  });

  describe("delete identity", () => {
    test("should delete identity properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const result = await zkIdentityService.deleteIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
      });

      expect(result).toBe(true);
    });

    test("should not delete identity if there is no any identity", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await zkIdentityService.deleteIdentity({ identityCommitment: mockDefaultIdentityCommitment });

      expect(result).toBe(false);
    });
  });

  describe("delete all identities", () => {
    test("should delete all identities properly", async () => {
      const isIdentitySet = await zkIdentityService.connectIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
        host: "http://localhost:3000",
      });
      const result = await zkIdentityService.deleteAllIdentities();

      expect(isIdentitySet).toBe(true);
      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(4);
    });

    test("should delete all identities properly without connected identity", async () => {
      const connectedIdentity = await zkIdentityService.getConnectedIdentity();
      const result = await zkIdentityService.deleteAllIdentities();

      expect(connectedIdentity).toBeUndefined();
      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(1);
    });

    test("should not delete all identities if there is no any identity", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await zkIdentityService.deleteAllIdentities();

      expect(result).toBe(false);
    });
  });

  describe("get connected identity", () => {
    test("should get connected identity properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const connectedIdentity = await zkIdentityService.getConnectedIdentity();

      expect(connectedIdentity).toBeDefined();
    });

    test("should get connected identity data properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const data = await zkIdentityService.getConnectedIdentityData();

      expect(data).toStrictEqual({
        commitment: mockDefaultIdentityCommitment,
        web2Provider: "",
        host: "http://localhost:3000",
      });
    });

    test("should not get connected identity if there is no any connected identity", async () => {
      const identity = await zkIdentityService.getConnectedIdentity();
      const data = await zkIdentityService.getConnectedIdentityData();

      expect(identity).toBeUndefined();
      expect(data).toStrictEqual({
        commitment: "",
        web2Provider: "",
        host: "",
      });
    });

    test("should not get connected identity if there is no any identity", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(undefined);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const result = await zkIdentityService.getConnectedIdentity();

      expect(result).toBeUndefined();
    });
  });

  describe("get identities", () => {
    test("should get identity commitments properly", async () => {
      const { commitments, identities } = await zkIdentityService.getIdentityCommitments();

      expect(commitments).toStrictEqual([mockDefaultIdentityCommitment]);
      expect(identities.size).toBe(mockDefaultIdentities.length);
    });

    test("should get identities properly", async () => {
      const identities = await zkIdentityService.getIdentities();

      expect(identities).toHaveLength(mockDefaultIdentities.length);
    });

    test("should get identities properly with disabled interrep identities", async () => {
      (getEnabledFeatures as jest.Mock).mockReturnValue({ INTERREP_IDENTITY: false });

      const identities = await zkIdentityService.getIdentities();

      expect(identities).toHaveLength(0);
    });

    test("should get number of identities properly", async () => {
      const result = await zkIdentityService.getNumOfIdentites();

      expect(result).toBe(mockDefaultIdentities.length);
    });
  });

  describe("create", () => {
    test("should be able to request a create identity modal", async () => {
      await zkIdentityService.createIdentityRequest({ host: "http://localhost:3000" });

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toBeCalledWith(defaultOptions);
    });

    test("should be able to request a connect identity modal", async () => {
      await zkIdentityService.connectIdentityRequest({ host: "http://localhost:3000" });

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toBeCalledWith(defaultOptions);
    });

    test("should create a new identity with ethereum wallet properly", async () => {
      const identityMessageSignature = "0x000";
      const identityStrategy: IdentityStrategy = "random";
      const identityOptions: CreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const result = await zkIdentityService.createIdentity({
        strategy: identityStrategy,
        walletType: EWallet.ETH_WALLET,
        messageSignature: identityMessageSignature,
        options: identityOptions,
        groups: [],
        host: "http://localhost:3000",
      });

      expect(result).toBeDefined();
    });

    test("should create a new identity with cryptkeeper properly", async () => {
      const identityStrategy: IdentityStrategy = "interrep";
      const identityOptions: CreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const result = await zkIdentityService.createIdentity({
        strategy: identityStrategy,
        walletType: EWallet.CRYPTKEEPER_WALLET,
        options: identityOptions,
        groups: [],
        host: "http://localhost:3000",
      });

      expect(result).toBeDefined();
    });

    test("should not create a new identity if there is no signature", async () => {
      const identityStrategy: IdentityStrategy = "interrep";
      const identityOptions: CreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const promise = zkIdentityService.createIdentity({
        strategy: identityStrategy,
        walletType: EWallet.ETH_WALLET,
        options: identityOptions,
        groups: [],
        host: "http://localhost:3000",
      });

      await expect(promise).rejects.toThrowError("No signature provided");
    });

    test("should not create a new identity if there is the same identity in the store", async () => {
      const identityMessageSignature = "0x000";
      const identityStrategy: IdentityStrategy = "interrep";
      const identityOptions: CreateIdentityOptions = {
        nonce: 0,
        web2Provider: "twitter",
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const successResult = await zkIdentityService.createIdentity({
        strategy: identityStrategy,
        walletType: EWallet.ETH_WALLET,
        messageSignature: identityMessageSignature,
        options: identityOptions,
        groups: [],
        host: "http://localhost:3000",
      });

      expect(successResult).toBeDefined();

      (createNewIdentity as jest.Mock).mockReturnValue({
        genIdentityCommitment: () => mockDefaultIdentityCommitment,
      });

      await expect(
        zkIdentityService.createIdentity({
          strategy: identityStrategy,
          walletType: EWallet.ETH_WALLET,
          messageSignature: identityMessageSignature,
          options: identityOptions,
          groups: [],
          host: "http://localhost:3000",
        }),
      ).rejects.toThrow("Identity is already exist. Try to change nonce or identity data.");

      await expect(
        zkIdentityService.createIdentity({
          strategy: identityStrategy,
          walletType: EWallet.ETH_WALLET,
          messageSignature: identityMessageSignature,
          options: { message: "message", account: ZERO_ADDRESS },
          groups: [],
          host: "http://localhost:3000",
        }),
      ).rejects.toThrow("Identity is already exist. Try to change nonce or identity data.");
    });
  });

  describe("backup", () => {
    test("should download encrypted identities", async () => {
      const result = await zkIdentityService.downloadEncryptedStorage("password");

      expect(result).toBeDefined();
    });

    test("should not download encrypted identities if storage is empty", async () => {
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(undefined);

      const result = await zkIdentityService.downloadEncryptedStorage("password");

      expect(result).toBeNull();
    });

    test("should upload encrypted identities", async () => {
      await zkIdentityService.uploadEncryptedStorage("encrypted", "password");

      const [instance] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      expect(instance.set).toBeCalledTimes(1);
      expect(instance.set).toBeCalledWith("encrypted");
    });

    test("should not upload encrypted identities if there is no data", async () => {
      await zkIdentityService.uploadEncryptedStorage("", "");

      const [instance] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      expect(instance.set).toBeCalledTimes(0);
    });
  });
});
