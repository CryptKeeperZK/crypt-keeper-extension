/* eslint-disable @typescript-eslint/unbound-method */
import { EventName } from "@cryptkeeperzk/providers";
import {
  EWallet,
  type ConnectedIdentityMetadata,
  type ICreateIdentityOptions,
  type IImportIdentityArgs,
} from "@cryptkeeperzk/types";
import { createNewIdentity } from "@cryptkeeperzk/zk";
import pick from "lodash/pick";
import browser from "webextension-polyfill";

import SimpleStorage from "@src/background/services/storage";
import ZkIdentityService from "@src/background/services/zkIdentity";
import { ZERO_ADDRESS } from "@src/config/const";
import {
  mockDefaultIdentity,
  mockDefaultIdentityCommitment,
  mockDefaultNullifier,
  mockDefaultTrapdoor,
} from "@src/config/mock/zk";
import { setStatus } from "@src/ui/ducks/app";
import { setConnectedIdentity, setIdentities } from "@src/ui/ducks/identities";
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
    { id: 1, url: mockDefaultIdentity.metadata.urlOrigin },
    { id: 2, url: mockDefaultIdentity.metadata.urlOrigin },
    { id: 3 },
  ];

  const defaultPopupTab = { id: 3, active: true, highlighted: true };

  const defaultNewIdentity = {
    serialize: () => JSON.stringify({ secret: "1234", metadata: mockDefaultIdentity.metadata }),
    genIdentityCommitment: () => "15206603389158210388485662342360617949291660595274505642693885456541816400292",
    metadata: { urlOrigin: "http://localhost:3000" } as ConnectedIdentityMetadata,
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

      const expectConnectIdentityAction = setConnectedIdentity(
        pick(mockDefaultIdentity.metadata, ["name", "urlOrigin"]),
      );

      const expectSetIdentitiesAction = setIdentities([
        { commitment: mockDefaultIdentityCommitment, metadata: mockDefaultIdentity.metadata },
      ]);

      const result = await zkIdentityService.unlock();

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(2);
      expect(pushMessage).toBeCalledWith(expectConnectIdentityAction);
      expect(pushMessage).toHaveBeenNthCalledWith(2, expectSetIdentitiesAction);
      expect(browser.tabs.sendMessage).toBeCalledTimes(2);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(1, defaultTabs[0].id, expectConnectIdentityAction);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(2, defaultTabs[1].id, expectConnectIdentityAction);
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

  describe("set connected identity", () => {
    test("should set connected identity properly", async () => {
      const expectConnectIdentityAction = setConnectedIdentity(
        pick(mockDefaultIdentity.metadata, ["name", "urlOrigin"]),
      );
      const expectedSetIdentitiesAction = setIdentities([
        { commitment: mockDefaultIdentityCommitment, metadata: mockDefaultIdentity.metadata },
      ]);

      const result = await zkIdentityService.connectIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
        urlOrigin: "http://localhost:3000",
      });

      expect(result).toBe(true);
      expect(pushMessage).toBeCalledTimes(2);
      expect(pushMessage).toHaveBeenNthCalledWith(1, expectConnectIdentityAction);
      expect(pushMessage).toHaveBeenNthCalledWith(2, expectedSetIdentitiesAction);
      expect(browser.tabs.sendMessage).toBeCalledTimes(4);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(1, defaultTabs[0].id, expectConnectIdentityAction);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(2, defaultTabs[1].id, expectConnectIdentityAction);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(3, defaultTabs[0].id, setStatus(mockDefaultStatus));
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(4, defaultTabs[1].id, setStatus(mockDefaultStatus));
    });

    test("should not set connected identity if there is no any saved identities", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await zkIdentityService.connectIdentity({
        identityCommitment: mockDefaultIdentityCommitment,
        urlOrigin: "http://localhost:3000",
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

  describe("set identity urlOrigin", () => {
    test("should set identity urlOrigin properly", async () => {
      const result = await zkIdentityService.setIdentityHost({
        identityCommitment: mockDefaultIdentityCommitment,
        urlOrigin: "http://localhost:3000",
      });

      expect(result).toBe(true);
    });

    test("should not set identity urlOrigin if there is no such identity", async () => {
      const result = await zkIdentityService.setIdentityHost({
        identityCommitment: "unknown",
        urlOrigin: "http://localhost:3000",
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
        urlOrigin: "http://localhost:3000",
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

      const data = await zkIdentityService.getConnectedIdentityData(
        {},
        { urlOrigin: mockDefaultIdentity.metadata.urlOrigin },
      );

      expect(data).toStrictEqual(pick(mockDefaultIdentity.metadata, ["name", "urlOrigin"]));
    });

    test("should no get connected identity data if urlOrigin is not the same properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const data = await zkIdentityService.getConnectedIdentityData({}, { urlOrigin: "unknown" });

      expect(data).toBeUndefined();
    });

    test("should get connected identity commitment properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const commitment = await zkIdentityService.getConnectedIdentityCommitment();

      expect(commitment).toBe(mockDefaultIdentityCommitment);
    });

    test("should not get connected identity if there is no any connected identity", async () => {
      const identity = await zkIdentityService.getConnectedIdentity();
      const data = await zkIdentityService.getConnectedIdentityData(
        {},
        { urlOrigin: mockDefaultIdentity.metadata.urlOrigin },
      );

      expect(identity).toBeUndefined();
      expect(data).toBeUndefined();
    });

    test("should not get connected identity if there is no connected urlOrigin", async () => {
      const identity = await zkIdentityService.getConnectedIdentity();
      const data = await zkIdentityService.getConnectedIdentityData({}, { urlOrigin: "" });

      expect(identity).toBeUndefined();
      expect(data).toBeUndefined();
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

    test("should not read connected identity data if there is no any identity", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(undefined);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const result = await zkIdentityService.getConnectedIdentityData({}, {});

      expect(result).toBeUndefined();
    });

    test("should not get connected identity commitment if there is no any identity", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      identityStorage.get.mockReturnValue(undefined);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      const result = await zkIdentityService.getConnectedIdentityCommitment();

      expect(result).toBe("");
    });

    test("should request identity commitment modal properly", async () => {
      await zkIdentityService.revealConnectedIdentityCommitmentRequest();

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

    test("should reveal identity commitment properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(mockSerializedDefaultIdentities);
      connectedIdentityStorage.get.mockReturnValue(mockDefaultIdentityCommitment);

      await zkIdentityService.revealConnectedIdentityCommitment();

      expect(browser.tabs.query).toBeCalledWith({});
      expect(browser.tabs.sendMessage).toBeCalledTimes(2);
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(1, defaultTabs[0].id, {
        type: EventName.REVEAL_COMMITMENT,
        payload: { commitment: mockDefaultIdentityCommitment },
      });
      expect(browser.tabs.sendMessage).toHaveBeenNthCalledWith(2, defaultTabs[1].id, {
        type: EventName.REVEAL_COMMITMENT,
        payload: { commitment: mockDefaultIdentityCommitment },
      });
    });

    test("should not reveal identity commitment if there is not connected identity properly", async () => {
      const [identityStorage, connectedIdentityStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];

      identityStorage.get.mockReturnValue(undefined);
      connectedIdentityStorage.get.mockReturnValue(undefined);

      await expect(zkIdentityService.revealConnectedIdentityCommitment()).rejects.toThrow(
        "No connected identity found",
      );
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

    test("should get identity properly", async () => {
      const identity = await zkIdentityService.getIdentity(mockDefaultIdentityCommitment);

      expect(identity).toStrictEqual({
        commitment: mockDefaultIdentityCommitment,
        metadata: mockDefaultIdentity.metadata,
      });
    });

    test("should return undefined if there is no such identity", async () => {
      const identity = await zkIdentityService.getIdentity("unknown");

      expect(identity).toBeUndefined();
    });

    test("should get number of identities properly", async () => {
      const result = await zkIdentityService.getNumOfIdentities();

      expect(result).toBe(mockDefaultIdentities.length);
    });
  });

  describe("create", () => {
    test("should request a create identity modal properly", async () => {
      await zkIdentityService.createIdentityRequest({ urlOrigin: "http://localhost:3000" });

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

    test("should request a connect identity modal properly", async () => {
      await zkIdentityService.connectIdentityRequest({ urlOrigin: "http://localhost:3000" });

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
        genIdentityCommitment: () => mockDefaultIdentityCommitment,
      });

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
        genIdentityCommitment: () => mockDefaultIdentityCommitment,
      });

      await expect(zkIdentityService.import(defaultArgs)).rejects.toThrow("Identity is already imported");
    });

    test("should request an import identity modal properly", async () => {
      await zkIdentityService.importRequest(
        { trapdoor: defaultArgs.trapdoor, nullifier: defaultArgs.nullifier },
        { urlOrigin: "http://localhost:3000" },
      );

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

    test("should request an import identity modal without origin properly", async () => {
      await zkIdentityService.importRequest({ trapdoor: defaultArgs.trapdoor, nullifier: defaultArgs.nullifier }, {});

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
    });

    test("should not upload encrypted identities if there is no data", async () => {
      await zkIdentityService.uploadEncryptedStorage("", "");

      const [instance] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      expect(instance.set).toBeCalledTimes(0);
    });

    test("should throw error when trying upload incorrect backup", async () => {
      await expect(zkIdentityService.uploadEncryptedStorage({}, "password")).rejects.toThrow(
        "Incorrect backup format for identities",
      );
    });

    test("should download storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await zkIdentityService.downloadStorage();

      expect(storage.get).toBeCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await zkIdentityService.restoreStorage("storage");

      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(zkIdentityService.restoreStorage({})).rejects.toThrow("Incorrect restore format for identities");
    });
  });
});
