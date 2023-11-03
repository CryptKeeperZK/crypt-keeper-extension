/* eslint-disable @typescript-eslint/unbound-method */
import browser from "webextension-polyfill";

import { VerifiableCredentialService } from "@src/background/services/credentials";
import SimpleStorage from "@src/background/services/storage";
import pushMessage from "@src/util/pushMessage";

import type { IRenameVerifiableCredentialArgs } from "@src/types";

import {
  credentialsMap,
  credentialsStorageString,
  defaultCredentialName,
  defaultMetadata,
  defaultPopupTab,
  defaultTabs,
  exampleCredential,
  exampleCredentialHash,
  exampleCredentialString,
  exampleCredentialStringTwo,
  exampleCredentialTwo,
} from "../__mocks__/mock";

jest.mock("@src/background/services/crypto", (): unknown => ({
  ...jest.requireActual("@src/background/services/crypto"),
  getInstance: jest.fn(() => ({
    encrypt: jest.fn((value: string) => value),
    decrypt: jest.fn((value: string) => value),
    generateEncryptedHmac: jest.fn((value: string) => value),
    getAuthenticBackup: jest.fn((encrypted: string | Record<string, string>) => encrypted),
  })),
}));

jest.mock("@src/background/services/storage");

interface MockStorage {
  get: jest.Mock;
  set: jest.Mock;
  clear: jest.Mock;
}

describe("background/services/credentials/VerifiableCredentialService", () => {
  const verifiableCredentialService = VerifiableCredentialService.getInstance();

  beforeEach(() => {
    (browser.tabs.create as jest.Mock).mockResolvedValue(defaultPopupTab);

    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);

    (browser.tabs.sendMessage as jest.Mock).mockRejectedValueOnce(false).mockResolvedValue(true);

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(credentialsStorageString);
      instance.set.mockResolvedValue(undefined);
      instance.clear.mockResolvedValue(undefined);
    });
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

  describe("verifiable credential requests", () => {
    test("should successfully create an add verifiable credential request", async () => {
      await verifiableCredentialService.addRequest(exampleCredentialString, {});

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

  describe("rename vc", () => {
    const defaultArgs: IRenameVerifiableCredentialArgs = {
      hash: exampleCredentialHash,
      name: "name",
    };

    test("should throw error if there is no hash or name", async () => {
      await expect(
        verifiableCredentialService.rename({
          hash: "",
          name: "",
        }),
      ).rejects.toThrow("Verifiable Credential hash and name are required.");
    });

    test("should throw error if there is no credential in the store", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      storage.get.mockResolvedValue(undefined);

      await expect(verifiableCredentialService.rename(defaultArgs)).rejects.toThrow(
        "Verifiable Credential does not exist.",
      );
    });

    test("should rename vc properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      await verifiableCredentialService.rename(defaultArgs);

      expect(storage.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("add and retrieve verifiable credentials", () => {
    test("should successfully add a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);
      credentialsStorage.set.mockResolvedValue(undefined);

      const result = verifiableCredentialService.add(
        {
          serialized: exampleCredentialString,
          name: defaultCredentialName,
        },
        defaultMetadata,
      );

      await expect(result).resolves.toBe(undefined);
    });

    test("should throw error is there is no serialized vc", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);
      credentialsStorage.set.mockResolvedValue(undefined);

      const result = verifiableCredentialService.add(
        {
          serialized: "",
          name: "",
        },
        defaultMetadata,
      );

      await expect(result).rejects.toThrow("Serialized Verifiable Credential is required.");
    });

    test("should add and retrieve a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);

      await verifiableCredentialService.add(
        {
          serialized: exampleCredentialString,
          name: defaultCredentialName,
        },
        defaultMetadata,
      );

      await verifiableCredentialService.add(
        {
          serialized: exampleCredentialStringTwo,
          name: defaultCredentialName,
        },
        defaultMetadata,
      );

      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      const verifiableCredentials = await verifiableCredentialService.getAll();

      expect(verifiableCredentials).toHaveLength(2);
      expect(verifiableCredentials[0].verifiableCredential).toStrictEqual(exampleCredential);
      expect(verifiableCredentials[1].verifiableCredential).toStrictEqual(exampleCredentialTwo);
    });

    test("should not add a verifiable credential with an existing id", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(
        verifiableCredentialService.add(
          {
            serialized: exampleCredentialString,
            name: defaultCredentialName,
          },
          defaultMetadata,
        ),
      ).rejects.toThrow("Verifiable Credential already exists.");
    });

    test("should not add a verifiable credential with an invalid format", async () => {
      await expect(
        verifiableCredentialService.add(
          {
            serialized: "invalid credential",
            name: "test name",
          },
          defaultMetadata,
        ),
      ).rejects.toThrow(SyntaxError);
    });
  });

  describe("delete verifiable credentials", () => {
    test("should delete a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await verifiableCredentialService.delete(exampleCredentialHash);

      expect(credentialsStorage.set).toHaveBeenCalledTimes(1);
      expect(credentialsStorage.set).toHaveBeenCalledWith(JSON.stringify([[...credentialsMap.entries()][1]]));
    });

    test("should throw error if there is no vc hash", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(verifiableCredentialService.delete("")).rejects.toThrow("Verifiable Credential hash is required.");

      expect(credentialsStorage.set).toHaveBeenCalledTimes(0);
    });

    test("should not delete a verifiable credential if it does not exist", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(verifiableCredentialService.delete("example hash")).rejects.toThrow(
        "Verifiable Credential does not exist.",
      );
      expect(credentialsStorage.set).toHaveBeenCalledTimes(0);
    });

    test("should delete all verifiable credentials", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await verifiableCredentialService.deleteAll();

      expect(credentialsStorage.clear).toHaveBeenCalledTimes(1);
    });

    test("should return false when deleting all verifiable credentials from empty storage", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(verifiableCredentialService.deleteAll()).rejects.toThrow("No Verifiable Credentials to delete.");
      expect(credentialsStorage.clear).toHaveBeenCalledTimes(0);
    });
  });

  describe("backup", () => {
    const examplePassword = "password";

    test("should download encrypted identities", async () => {
      const result = await verifiableCredentialService.downloadEncryptedStorage(examplePassword);

      expect(result).toBeDefined();
    });

    test("should not download encrypted identities if storage is empty", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);

      const result = await verifiableCredentialService.downloadEncryptedStorage(examplePassword);

      expect(result).toBeNull();
    });

    test("should upload encrypted identities", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialService.uploadEncryptedStorage(credentialsStorageString, examplePassword);

      expect(credentialsStorage.set).toHaveBeenCalledTimes(1);
      expect(credentialsStorage.set).toHaveBeenCalledWith(credentialsStorageString);
    });

    test("should not upload encrypted identities if there is no data", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialService.uploadEncryptedStorage("", "");

      expect(credentialsStorage.set).toHaveBeenCalledTimes(0);
    });

    test("should throw error when trying upload incorrect backup", async () => {
      await expect(verifiableCredentialService.uploadEncryptedStorage({}, "password")).rejects.toThrow(
        "Incorrect backup format for credentials",
      );
    });

    test("should download storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialService.downloadStorage();

      expect(storage.get).toHaveBeenCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialService.restoreStorage("storage");

      expect(storage.set).toHaveBeenCalledTimes(1);
      expect(storage.set).toHaveBeenCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(verifiableCredentialService.restoreStorage({})).rejects.toThrow(
        "Incorrect restore format for credentials",
      );
    });
  });
});
