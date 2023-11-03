/* eslint-disable @typescript-eslint/unbound-method */
import {
  EWallet,
  type ConnectedIdentityMetadata,
  type ICreateIdentityOptions,
  type IImportIdentityArgs,
} from "@cryptkeeperzk/types";
import { createNewIdentity } from "@cryptkeeperzk/zk";
import browser from "webextension-polyfill";

import SimpleStorage from "@src/background/services/storage";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { ZERO_ADDRESS } from "@src/config/const";
import {
  mockDefaultConnection,
  mockDefaultIdentity,
  mockDefaultIdentityCommitment,
  mockDefaultNullifier,
  mockDefaultTrapdoor,
} from "@src/config/mock/zk";
import pushMessage from "@src/util/pushMessage";

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
    getAuthenticBackup: jest.fn((encrypted: string | Record<string, string>) => encrypted),
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

const mockDefaultStatus = {
  isUnlocked: true,
  isInitialized: true,
  isMnemonicGenerated: true,
};

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    getStatus: jest.fn(() => Promise.resolve(mockDefaultStatus)),
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

  const defaultTabs = [
    { id: 1, url: mockDefaultConnection.urlOrigin },
    { id: 2, url: mockDefaultConnection.urlOrigin },
    { id: 3 },
  ];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultNewIdentity = {
    serialize: () => JSON.stringify({ secret: "1234", metadata: mockDefaultIdentity.metadata }),
    genIdentityCommitment: () => "15206603389158210388485662342360617949291660595274505642693885456541816400292",
    metadata: { name: "Account #1" } as ConnectedIdentityMetadata,
  };

  beforeEach(() => {
    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockReturnValue(mockSerializedDefaultIdentities);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
    });

    (createNewIdentity as jest.Mock).mockReturnValue(defaultNewIdentity);
  });

  afterEach(async () => {
    await zkIdentityService.lock();

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockClear();
      instance.set.mockClear();
      instance.clear.mockClear();
    });

    (pushMessage as jest.Mock).mockClear();

    (browser.tabs.sendMessage as jest.Mock).mockClear();
  });

  describe("unlock", () => {
    test("should unlock properly", async () => {
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockResolvedValue(mockSerializedDefaultIdentities);

      const result = await zkIdentityService.unlock();

      expect(result).toBe(true);
    });

    test("should unlock properly with empty store", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockResolvedValueOnce(mockSerializedDefaultIdentities).mockResolvedValue(undefined);
      });

      await zkIdentityService.lock();
      const result = await zkIdentityService.unlock();

      expect(result).toBe(true);
    });
  });

  test("should await unlock properly", async () => {
    zkIdentityService.awaitUnlock();
    const isUnlocked = await zkIdentityService.unlock();
    const isUnlockCompleted = zkIdentityService.onUnlocked();

    expect(isUnlocked).toBe(true);
    expect(isUnlockCompleted).toBe(true);
  });

  test("should not unlock twice", async () => {
    const isUnlockedFirst = await zkIdentityService.unlock();
    const isUnlockedSecond = await zkIdentityService.unlock();

    expect(isUnlockedFirst).toBe(true);
    expect(isUnlockedSecond).toBe(true);
    expect(await zkIdentityService.awaitUnlock()).toBeUndefined();
  });

  describe("set identity name", () => {
    beforeEach(async () => {
      await zkIdentityService.unlock();
    });

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

  describe("delete identity", () => {
    beforeEach(async () => {
      await zkIdentityService.unlock();
    });

    test("should delete identity properly", async () => {
      const [identityStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);

      const result = await zkIdentityService.deleteIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
      });

      expect(result).toStrictEqual({
        identityCommitment: mockDefaultIdentityCommitment,
      });
    });

    test("should not delete identity if there is no any identity", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await zkIdentityService.lock();
      await zkIdentityService.unlock();

      await expect(
        zkIdentityService.deleteIdentity({ identityCommitment: mockDefaultIdentityCommitment }),
      ).rejects.toThrow("CryptKeeper: no identity found");
    });
  });

  describe("delete all identities", () => {
    beforeEach(async () => {
      await zkIdentityService.unlock();
    });

    test("should delete all identities properly", async () => {
      const result = await zkIdentityService.deleteAllIdentities();

      expect(result).toBe(true);
      expect(pushMessage).toHaveBeenCalledTimes(1);
    });

    test("should not delete all identities if there is no any identity", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await zkIdentityService.lock();
      await zkIdentityService.unlock();

      const result = await zkIdentityService.deleteAllIdentities();

      expect(result).toBe(false);
    });
  });

  describe("get identities", () => {
    beforeEach(async () => {
      await zkIdentityService.unlock();
    });

    test("should get identity commitments properly", () => {
      const { commitments } = zkIdentityService.getIdentityCommitments();

      expect(commitments).toStrictEqual([mockDefaultIdentityCommitment]);
    });

    test("should get identities properly", () => {
      const identities = zkIdentityService.getIdentities();

      expect(identities).toHaveLength(mockDefaultIdentities.length);
    });

    test("should get identity properly", () => {
      const identity = zkIdentityService.getIdentity(mockDefaultIdentityCommitment);

      expect(identity?.metadata).toStrictEqual(mockDefaultIdentity.metadata);
    });

    test("should return undefined if there is no such identity", () => {
      const identity = zkIdentityService.getIdentity("unknown");

      expect(identity).toBeUndefined();
    });

    test("should get number of identities properly", () => {
      const result = zkIdentityService.getNumOfIdentities();

      expect(result).toBe(mockDefaultIdentities.length);
    });
  });

  describe("create", () => {
    test("should request a create identity modal properly", async () => {
      await zkIdentityService.createIdentityRequest({ urlOrigin: "http://localhost:3000" });

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toHaveBeenCalledWith(defaultOptions);
    });

    test("should create a new identity with ethereum wallet properly", async () => {
      const identityMessageSignature = "0x000";
      const identityOptions: ICreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const result = await zkIdentityService.createIdentity({
        walletType: EWallet.ETH_WALLET,
        messageSignature: identityMessageSignature,
        options: identityOptions,
        isDeterministic: false,
        groups: [],
        urlOrigin: "http://localhost:3000",
      });

      expect(result).toBeDefined();
    });

    test("should create a new identity with CryptKeeper properly", async () => {
      const identityOptions: ICreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const result = await zkIdentityService.createIdentity({
        walletType: EWallet.CRYPTKEEPER_WALLET,
        options: identityOptions,
        isDeterministic: true,
        groups: [],
        urlOrigin: "http://localhost:3000",
      });

      expect(result).toBeDefined();
    });

    test("should not create a new identity if there is the same identity in the store", async () => {
      const identityMessageSignature = "0x000";
      const identityOptions: ICreateIdentityOptions = {
        nonce: 0,
        account: ZERO_ADDRESS,
        name: "Name",
        message: "message",
      };

      const successResult = await zkIdentityService.createIdentity({
        walletType: EWallet.ETH_WALLET,
        messageSignature: identityMessageSignature,
        options: identityOptions,
        isDeterministic: true,
        groups: [],
        urlOrigin: "http://localhost:3000",
      });

      expect(successResult).toBeDefined();

      (createNewIdentity as jest.Mock).mockReturnValue({
        serialize: () => JSON.stringify({ secret: "1234", metadata: mockDefaultIdentity.metadata }),
        genIdentityCommitment: () => mockDefaultIdentityCommitment,
        metadata: mockDefaultIdentity.metadata,
      });

      await zkIdentityService.lock();
      await zkIdentityService.unlock();

      await expect(
        zkIdentityService.createIdentity({
          walletType: EWallet.ETH_WALLET,
          messageSignature: identityMessageSignature,
          options: identityOptions,
          isDeterministic: true,
          groups: [],
          urlOrigin: "http://localhost:3000",
        }),
      ).rejects.toThrow("Identity is already exist. Try to change nonce or identity data.");

      await expect(
        zkIdentityService.createIdentity({
          walletType: EWallet.ETH_WALLET,
          messageSignature: identityMessageSignature,
          isDeterministic: true,
          options: { message: "message", account: ZERO_ADDRESS, nonce: 0 },
          groups: [],
          urlOrigin: "http://localhost:3000",
        }),
      ).rejects.toThrow("Identity is already exist. Try to change nonce or identity data.");
    });
  });

  describe("import", () => {
    const defaultArgs: IImportIdentityArgs = {
      name: "Name",
      nullifier: mockDefaultNullifier,
      trapdoor: mockDefaultTrapdoor,
      messageSignature: "signature",
      urlOrigin: "http://localhost:3000",
    };

    beforeEach(async () => {
      await zkIdentityService.unlock();
    });

    test("should import new identity properly", async () => {
      (createNewIdentity as jest.Mock).mockReturnValue({
        ...defaultNewIdentity,
        metadata: { ...defaultNewIdentity.metadata, isImported: true },
      });

      const result = await zkIdentityService.import(defaultArgs);

      expect(result).toBeDefined();
    });

    test("should not import new identity if there is the same identity in the store", async () => {
      (createNewIdentity as jest.Mock).mockReturnValue({
        serialize: () => JSON.stringify({ secret: "1234", metadata: mockDefaultIdentity.metadata }),
        genIdentityCommitment: () => mockDefaultIdentityCommitment,
      });

      await expect(zkIdentityService.import(defaultArgs)).rejects.toThrow("Identity is already imported");
    });

    test("should request an import identity modal properly", async () => {
      await zkIdentityService.importRequest(
        { trapdoor: defaultArgs.trapdoor, nullifier: defaultArgs.nullifier },
        { urlOrigin: "http://localhost:3000" },
      );

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toHaveBeenCalledWith(defaultOptions);
    });

    test("should request an import identity modal without origin properly", async () => {
      await zkIdentityService.importRequest({ trapdoor: defaultArgs.trapdoor, nullifier: defaultArgs.nullifier }, {});

      expect(browser.tabs.query).toHaveBeenCalledWith({ lastFocusedWindow: true });

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.windows.create).toHaveBeenCalledWith(defaultOptions);
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
      expect(instance.set).toHaveBeenCalledTimes(1);
    });

    test("should not upload encrypted identities if there is no data", async () => {
      await zkIdentityService.uploadEncryptedStorage("", "");

      const [instance] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      expect(instance.set).toHaveBeenCalledTimes(0);
    });

    test("should throw error when trying upload incorrect backup", async () => {
      await expect(zkIdentityService.uploadEncryptedStorage({}, "password")).rejects.toThrow(
        "Incorrect backup format for identities",
      );
    });

    test("should download storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await zkIdentityService.downloadStorage();

      expect(storage.get).toHaveBeenCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await zkIdentityService.restoreStorage("storage");

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(zkIdentityService.restoreStorage({})).rejects.toThrow("Incorrect restore format for identities");
    });
  });
});
