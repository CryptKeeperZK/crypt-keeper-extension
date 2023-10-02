/* eslint-disable @typescript-eslint/unbound-method */
import { EventName } from "@cryptkeeperzk/providers/src/event";
import browser from "webextension-polyfill";

import VerifiableCredentialsService from "@src/background/services/credentials";
import {
  generateInitialMetadataForVC,
  serializeCryptkeeperVC,
  serializeVC,
} from "@src/background/services/credentials/utils";
import SimpleStorage from "@src/background/services/storage";
import pushMessage from "@src/util/pushMessage";

import type {
  IVerifiablePresentation,
  IVerifiableCredential,
  IVerifiablePresentationRequest,
} from "@cryptkeeperzk/types";
import type { ICryptkeeperVerifiableCredential } from "@src/types";

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
  const exampleCredentialString = serializeVC(exampleCredential);
  const exampleCredentialMetadata = generateInitialMetadataForVC(exampleCredential, defaultCredentialName);
  const exampleCredentialHash = exampleCredentialMetadata.hash;
  const exampleCryptkeeperCredential: ICryptkeeperVerifiableCredential = {
    vc: exampleCredential,
    metadata: exampleCredentialMetadata,
  };
  const exampleCryptkeeperCredentialString = serializeCryptkeeperVC(exampleCryptkeeperCredential);

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
  const exampleCredentialStringTwo = serializeVC(exampleCredentialTwo);
  const exampleCredentialMetadataTwo = generateInitialMetadataForVC(exampleCredentialTwo, defaultCredentialName);
  const exampleCredentialHashTwo = exampleCredentialMetadataTwo.hash;
  const exampleCryptkeeperCredentialTwo: ICryptkeeperVerifiableCredential = {
    vc: exampleCredentialTwo,
    metadata: exampleCredentialMetadataTwo,
  };
  const exampleCryptkeeperCredentialStringTwo = serializeCryptkeeperVC(exampleCryptkeeperCredentialTwo);

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
      instance.get.mockReturnValue(credentialsStorageString);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
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
      await verifiableCredentialsService.handleAddVCRequest(exampleCredentialString);

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.windows.create).toBeCalledWith(defaultOptions);
    });

    test("should successfully reject a verifiable credential request", async () => {
      await verifiableCredentialsService.rejectVCRequest();

      expect(browser.tabs.query).toBeCalledWith({ active: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.USER_REJECT,
        payload: { type: EventName.VERIFIABLE_CREDENTIAL_REQUEST },
      });
    });
  });

  describe("generate verifiable presentations", () => {
    test("should successfully create a verifiable presentation request", async () => {
      await verifiableCredentialsService.handleVPRequest(exampleVerifiablePresentationRequest);

      const defaultOptions = {
        tabId: defaultPopupTab.id,
        type: "popup",
        focused: true,
        width: 385,
        height: 610,
      };

      expect(browser.tabs.query).toBeCalledWith({ lastFocusedWindow: true });
      expect(browser.windows.create).toBeCalledWith(defaultOptions);
    });

    test("should successfully reject a verifiable presentation request", async () => {
      await verifiableCredentialsService.rejectVPRequest();

      expect(browser.tabs.query).toBeCalledWith({ active: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.USER_REJECT,
        payload: { type: EventName.VERIFIABLE_PRESENTATION_REQUEST },
      });
    });

    test("should successfully generate a verifiable presentation", async () => {
      await verifiableCredentialsService.announceVP(exampleVerifiablePresentation);

      expect(browser.tabs.query).toBeCalledWith({ active: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.NEW_VERIFIABLE_PRESENTATION,
        payload: { vp: exampleVerifiablePresentation },
      });
    });

    test("should successfully generate a verifiable presentation with cryptkeeper", async () => {
      const exampleAddress = "0x123";
      const ETHEREUM_SIGNATURE_SPECIFICATION_TYPE = "EthereumEip712Signature2021";
      const VERIFIABLE_CREDENTIAL_PROOF_PURPOSE = "assertionMethod";

      await verifiableCredentialsService.signAndAnnounceVP({
        vp: exampleVerifiablePresentation,
        address: exampleAddress,
      });

      const signedVerifiablePresentation = {
        ...exampleVerifiablePresentation,
        proof: [
          {
            type: [ETHEREUM_SIGNATURE_SPECIFICATION_TYPE],
            proofPurpose: VERIFIABLE_CREDENTIAL_PROOF_PURPOSE,
            verificationMethod: exampleAddress,
            created: new Date(),
            proofValue: exampleSignature,
          },
        ],
      };

      expect(browser.tabs.query).toBeCalledWith({ active: true });
      expect(browser.tabs.sendMessage).toBeCalledWith(defaultTabs[0].id, {
        type: EventName.NEW_VERIFIABLE_PRESENTATION,
        payload: { vp: signedVerifiablePresentation },
      });
    });
  });

  describe("add and retrieve verifiable credentials", () => {
    test("should successfully add a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(undefined);
      credentialsStorage.set.mockReturnValue(undefined);

      const result = verifiableCredentialsService.addVC({
        serialized: exampleCredentialString,
        name: defaultCredentialName,
      });

      await expect(result).resolves.toBe(undefined);
    });

    test("should fail to add an empty verifiable credential", async () => {
      await expect(
        verifiableCredentialsService.addVC({
          serialized: "",
          name: defaultCredentialName,
        }),
      ).rejects.toThrow("Serialized Verifiable Credential is required.");
    });

    test("should add and retrieve a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(undefined);

      await verifiableCredentialsService.addVC({
        serialized: exampleCredentialString,
        name: defaultCredentialName,
      });
      await verifiableCredentialsService.addVC({
        serialized: exampleCredentialStringTwo,
        name: defaultCredentialName,
      });

      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      const verifiableCredentials = await verifiableCredentialsService.getAllVCs();

      expect(verifiableCredentials.length).toBe(2);
      expect(verifiableCredentials[0].vc).toEqual(exampleCredential);
      expect(verifiableCredentials[1].vc).toEqual(exampleCredentialTwo);
    });

    test("should not add a verifiable credential with an existing id", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await expect(
        verifiableCredentialsService.addVC({
          serialized: exampleCredentialString,
          name: defaultCredentialName,
        }),
      ).rejects.toThrow("Verifiable Credential already exists.");
    });

    test("should not add a verifiable credential with an invalid format", async () => {
      await expect(
        verifiableCredentialsService.addVC({
          serialized: "invalid credential",
          name: "test name",
        }),
      ).rejects.toThrow(SyntaxError);
    });
  });

  describe("rename verifiable credentials", () => {
    const newName = "a new name";

    test("should rename a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await verifiableCredentialsService.renameVC({ hash: exampleCredentialHash, newName });

      const newCredentialString = serializeCryptkeeperVC({
        vc: exampleCryptkeeperCredential.vc,
        metadata: { name: newName, hash: exampleCredentialHash },
      });
      const newCredentialsMap = new Map<string, string>();
      newCredentialsMap.set(exampleCredentialHash, newCredentialString);
      newCredentialsMap.set(exampleCredentialHashTwo, exampleCryptkeeperCredentialStringTwo);
      const newCredentialsStorageString = JSON.stringify(Array.from(newCredentialsMap));

      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(newCredentialsStorageString);
    });

    test("should not rename a verifiable credential if hash is not provided", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await expect(verifiableCredentialsService.renameVC({ hash: "", newName })).rejects.toThrow(
        "Verifiable Credential hash and name are required.",
      );
      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should not rename a verifiable credential if it does not exist", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await expect(verifiableCredentialsService.renameVC({ hash: "random hash", newName })).rejects.toThrow(
        "Verifiable Credential does not exist.",
      );
      expect(credentialsStorage.set).toBeCalledTimes(0);
    });
  });

  describe("delete verifiable credentials", () => {
    test("should delete a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await verifiableCredentialsService.deleteVC(exampleCredentialHash);

      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(JSON.stringify([[...credentialsMap.entries()][1]]));
    });

    test("should not delete a verifiable credential if it does not exist", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await expect(verifiableCredentialsService.deleteVC("example hash")).rejects.toThrow(
        "Verifiable Credential does not exist.",
      );
      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should not delete a verifiable credential if hash is not provided", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await expect(verifiableCredentialsService.deleteVC("")).rejects.toThrow(
        "Verifiable Credential hash is required.",
      );
      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should delete all verifiable credentials", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      await verifiableCredentialsService.deleteAllVCs();

      expect(credentialsStorage.clear).toBeCalledTimes(1);
    });

    test("should return false when deleting all verifiable credentials from empty storage", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(undefined);
      credentialsStorage.set.mockReturnValue(undefined);

      await expect(verifiableCredentialsService.deleteAllVCs()).rejects.toThrow("No Verifiable Credentials to delete.");
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
      credentialsStorage.get.mockReturnValue(undefined);

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

    test("should not upload encrypted identities if data is invalid", async () => {
      await expect(verifiableCredentialsService.uploadEncryptedStorage({ a: "b" }, examplePassword)).rejects.toThrow(
        "Incorrect backup format for credentials",
      );
    });

    test("should download storage properly", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialsService.downloadStorage();

      expect(credentialsStorage.get).toBeCalledTimes(1);
    });

    test("should restore storage properly", () => {
      const data = "data";

      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      verifiableCredentialsService.restoreStorage(data);

      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(data);
    });

    test("should not restore storage if backup data is invalid", async () => {
      await expect(verifiableCredentialsService.restoreStorage({ a: "b" })).rejects.toThrow(
        "Incorrect restore format for credentials",
      );
    });
  });
});
