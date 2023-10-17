/* eslint-disable @typescript-eslint/unbound-method */
import { EventName } from "@cryptkeeperzk/providers";
import browser from "webextension-polyfill";

import VerifiableCredentialsService from "@src/background/services/credentials";
import SimpleStorage from "@src/background/services/storage";
import {
  generateInitialMetadataForVerifiableCredential,
  serializeCryptkeeperVerifiableCredential,
  serializeVerifiableCredential,
} from "@src/util/credentials";
import pushMessage from "@src/util/pushMessage";

import type {
  IVerifiablePresentation,
  IVerifiableCredential,
  IVerifiablePresentationRequest,
} from "@cryptkeeperzk/types";
import type { ICryptkeeperVerifiableCredential, IRenameVerifiableCredentialArgs } from "@src/types";

jest.mock("@src/background/services/crypto", (): unknown => ({
  ...jest.requireActual("@src/background/services/crypto"),
  getInstance: jest.fn(() => ({
    encrypt: jest.fn((value: string) => value),
    decrypt: jest.fn((value: string) => value),
    generateEncryptedHmac: jest.fn((value: string) => value),
    getAuthenticBackup: jest.fn((encrypted: string | Record<string, string>) => encrypted),
  })),
}));

const exampleSignature = "ck-signature";
jest.mock("@src/background/services/wallet", (): unknown => ({
  getInstance: jest.fn(() => ({
    signMessage: jest.fn(() => Promise.resolve(exampleSignature)),
  })),
}));

jest.mock("@src/util/pushMessage");

jest.mock("@src/background/services/storage");

interface MockStorage {
  get: jest.Mock;
  set: jest.Mock;
  clear: jest.Mock;
}

describe("background/services/credentials", () => {
  const defaultCredentialName = "Verifiable Credential";
  const exampleCredential: IVerifiableCredential = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "did:example:123",
    type: ["VerifiableCredential"],
    issuer: "did:example:123456789abcdefghi",
    issuanceDate: new Date("2010-01-01T19:23:24Z"),
    credentialSubject: {
      id: "did:example:123456789abcdefghi",
      claims: {
        name: "John Doe",
      },
    },
  };
  const exampleCredentialString = serializeVerifiableCredential(exampleCredential);
  const exampleCredentialMetadata = generateInitialMetadataForVerifiableCredential(
    exampleCredential,
    defaultCredentialName,
  );
  const exampleCredentialHash = exampleCredentialMetadata.hash;
  const exampleCryptkeeperCredential: ICryptkeeperVerifiableCredential = {
    verifiableCredential: exampleCredential,
    metadata: exampleCredentialMetadata,
  };
  const exampleCryptkeeperCredentialString = serializeCryptkeeperVerifiableCredential(exampleCryptkeeperCredential);

  const exampleCredentialTwo: IVerifiableCredential = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "did:example:1234",
    type: ["VerifiableCredential", "NameCredential"],
    issuer: "did:example:123456abcdefghi",
    issuanceDate: new Date("2010-01-02T19:23:24Z"),
    credentialSubject: {
      id: "did:example:123456abcdefghi",
      claims: {
        name: "Jane Doe",
      },
    },
  };
  const exampleCredentialStringTwo = serializeVerifiableCredential(exampleCredentialTwo);
  const exampleCredentialMetadataTwo = generateInitialMetadataForVerifiableCredential(
    exampleCredentialTwo,
    defaultCredentialName,
  );
  const exampleCredentialHashTwo = exampleCredentialMetadataTwo.hash;
  const exampleCryptkeeperCredentialTwo: ICryptkeeperVerifiableCredential = {
    verifiableCredential: exampleCredentialTwo,
    metadata: exampleCredentialMetadataTwo,
  };
  const exampleCryptkeeperCredentialStringTwo = serializeCryptkeeperVerifiableCredential(
    exampleCryptkeeperCredentialTwo,
  );

  const credentialsMap = new Map<string, string>();
  credentialsMap.set(exampleCredentialHash, exampleCryptkeeperCredentialString);
  credentialsMap.set(exampleCredentialHashTwo, exampleCryptkeeperCredentialStringTwo);
  const credentialsStorageString = JSON.stringify(Array.from(credentialsMap));

  const exampleVerifiablePresentationRequest: IVerifiablePresentationRequest = {
    request: "example request",
  };
  const exampleVerifiablePresentation: IVerifiablePresentation = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    verifiableCredential: [exampleCredential],
  };

  const defaultTabs = [{ id: 1 }];

  const defaultPopupTab = { id: 1, active: true, highlighted: true };

  const verifiableCredentialsService = VerifiableCredentialsService.getInstance();

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

  describe("add and reject verifiable credential requests", () => {
    test("should successfully create an add verifiable credential request", async () => {
      await verifiableCredentialsService.addVerifiableCredentialRequest(exampleCredentialString);

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

    test("should successfully reject a verifiable credential request", async () => {
      await verifiableCredentialsService.rejectVerifiableCredentialRequest();

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.USER_REJECT,
        payload: { type: EventName.ADD_VERIFIABLE_CREDENTIAL },
      });
    });
  });

  describe("rename vc", () => {
    const defaultArgs: IRenameVerifiableCredentialArgs = {
      verifiableCredentialHash: exampleCredentialHash,
      newVerifiableCredentialName: "name",
    };

    test("should throw error if there is no hash or name", async () => {
      await expect(
        verifiableCredentialsService.renameVerifiableCredential({
          verifiableCredentialHash: "",
          newVerifiableCredentialName: "",
        }),
      ).rejects.toThrowError("Verifiable Credential hash and name are required.");
    });

    test("should throw error if there is no credential in the store", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      storage.get.mockResolvedValue(undefined);

      await expect(verifiableCredentialsService.renameVerifiableCredential(defaultArgs)).rejects.toThrowError(
        "Verifiable Credential does not exist.",
      );
    });

    test("should rename vc properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      await verifiableCredentialsService.renameVerifiableCredential(defaultArgs);

      expect(storage.set).toBeCalledTimes(1);
    });
  });

  describe("generate verifiable presentations", () => {
    test("should successfully create a generate verifiable presentation request", async () => {
      await verifiableCredentialsService.generateVerifiablePresentationRequest(exampleVerifiablePresentationRequest);

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

    test("should successfully reject a verifiable presentation request", async () => {
      await verifiableCredentialsService.rejectVerifiablePresentationRequest();

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.USER_REJECT,
        payload: { type: EventName.VERIFIABLE_PRESENTATION_REQUEST },
      });
    });

    test("should successfully generate a verifiable presentation", async () => {
      await verifiableCredentialsService.generateVerifiablePresentation(exampleVerifiablePresentation);

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.GENERATE_VERIFIABLE_PRESENTATION,
        payload: { verifiablePresentation: exampleVerifiablePresentation },
      });
    });

    test("should successfully generate a verifiable presentation with cryptkeeper", async () => {
      const exampleAddress = "0x123";
      const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
      const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

      const created = new Date();
      await verifiableCredentialsService.generateVerifiablePresentationWithCryptkeeper({
        verifiablePresentation: exampleVerifiablePresentation,
        address: exampleAddress,
        created,
      });

      const signedVerifiablePresentation = {
        ...exampleVerifiablePresentation,
        proof: [
          {
            type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
            proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
            verificationMethod: exampleAddress,
            created,
            proofValue: exampleSignature,
          },
        ],
      };

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.GENERATE_VERIFIABLE_PRESENTATION,
        payload: { verifiablePresentation: signedVerifiablePresentation },
      });
    });

    test("should successfully generate a verifiable presentation without date", async () => {
      const exampleAddress = "0x123";

      await verifiableCredentialsService.generateVerifiablePresentationWithCryptkeeper({
        verifiablePresentation: exampleVerifiablePresentation,
        address: exampleAddress,
      });

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.tabs.sendMessage).toBeCalledTimes(1);
    });
  });

  describe("add and retrieve verifiable credentials", () => {
    test("should successfully add a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);
      credentialsStorage.set.mockResolvedValue(undefined);

      const result = verifiableCredentialsService.addVerifiableCredential({
        serializedVerifiableCredential: exampleCredentialString,
        verifiableCredentialName: defaultCredentialName,
      });

      await expect(result).resolves.toBe(undefined);
    });

    test("should throw error is there is no serialized vc", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);
      credentialsStorage.set.mockResolvedValue(undefined);

      const result = verifiableCredentialsService.addVerifiableCredential({
        serializedVerifiableCredential: "",
        verifiableCredentialName: "",
      });

      await expect(result).rejects.toThrowError("Serialized Verifiable Credential is required.");
    });

    test("should add and retrieve a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);

      await verifiableCredentialsService.addVerifiableCredential({
        serializedVerifiableCredential: exampleCredentialString,
        verifiableCredentialName: defaultCredentialName,
      });
      await verifiableCredentialsService.addVerifiableCredential({
        serializedVerifiableCredential: exampleCredentialStringTwo,
        verifiableCredentialName: defaultCredentialName,
      });

      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      const verifiableCredentials = await verifiableCredentialsService.getAllVerifiableCredentials();

      expect(verifiableCredentials.length).toBe(2);
      expect(verifiableCredentials[0].verifiableCredential).toEqual(exampleCredential);
      expect(verifiableCredentials[1].verifiableCredential).toEqual(exampleCredentialTwo);
    });

    test("should not add a verifiable credential with an existing id", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(
        verifiableCredentialsService.addVerifiableCredential({
          serializedVerifiableCredential: exampleCredentialString,
          verifiableCredentialName: defaultCredentialName,
        }),
      ).rejects.toThrow("Verifiable Credential already exists.");
    });

    test("should not add a verifiable credential with an invalid format", async () => {
      await expect(
        verifiableCredentialsService.addVerifiableCredential({
          serializedVerifiableCredential: "invalid credential",
          verifiableCredentialName: "test name",
        }),
      ).rejects.toThrow(SyntaxError);
    });
  });

  describe("delete verifiable credentials", () => {
    test("should delete a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await verifiableCredentialsService.deleteVerifiableCredential(exampleCredentialHash);

      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(JSON.stringify([[...credentialsMap.entries()][1]]));
    });

    test("should throw error if there is no vc hash", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(verifiableCredentialsService.deleteVerifiableCredential("")).rejects.toThrowError(
        "Verifiable Credential hash is required.",
      );

      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should not delete a verifiable credential if it does not exist", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(verifiableCredentialsService.deleteVerifiableCredential("example hash")).rejects.toThrow(
        "Verifiable Credential does not exist.",
      );
      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should delete all verifiable credentials", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(credentialsStorageString);
      credentialsStorage.set.mockResolvedValue(undefined);

      await verifiableCredentialsService.deleteAllVerifiableCredentials();

      expect(credentialsStorage.clear).toBeCalledTimes(1);
    });

    test("should return false when deleting all verifiable credentials from empty storage", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);
      credentialsStorage.set.mockResolvedValue(undefined);

      await expect(verifiableCredentialsService.deleteAllVerifiableCredentials()).rejects.toThrow(
        "No Verifiable Credentials to delete.",
      );
      expect(credentialsStorage.clear).toBeCalledTimes(0);
    });
  });

  describe("backup", () => {
    const examplePassword = "password";

    test("should download encrypted identities", async () => {
      const result = await verifiableCredentialsService.downloadEncryptedStorage(examplePassword);

      expect(result).toBeDefined();
    });

    test("should not download encrypted identities if storage is empty", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockResolvedValue(undefined);

      const result = await verifiableCredentialsService.downloadEncryptedStorage(examplePassword);

      expect(result).toBeNull();
    });

    test("should upload encrypted identities", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialsService.uploadEncryptedStorage(credentialsStorageString, examplePassword);

      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(credentialsStorageString);
    });

    test("should not upload encrypted identities if there is no data", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialsService.uploadEncryptedStorage("", "");

      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should throw error when trying upload incorrect backup", async () => {
      await expect(verifiableCredentialsService.uploadEncryptedStorage({}, "password")).rejects.toThrow(
        "Incorrect backup format for credentials",
      );
    });

    test("should download storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialsService.downloadStorage();

      expect(storage.get).toBeCalledTimes(1);
    });

    test("should restore storage properly", async () => {
      const [storage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialsService.restoreStorage("storage");

      expect(storage.set).toBeCalledTimes(1);
      expect(storage.set).toBeCalledWith("storage");
    });

    test("should throw error when trying to restore incorrect data", async () => {
      await expect(verifiableCredentialsService.restoreStorage({})).rejects.toThrow(
        "Incorrect restore format for credentials",
      );
    });
  });
});
