import VerifiableCredentialsService from "@src/background/services/credentials";
import {
  generateInitialMetadataForVerifiableCredential,
  serializeCryptkeeperVerifiableCredential,
  serializeVerifiableCredential,
} from "@src/background/services/credentials/utils";
import SimpleStorage from "@src/background/services/storage";
import { CryptkeeperVerifiableCredential, VerifiableCredential } from "@src/types";

jest.mock("@src/background/services/crypto", (): unknown => ({
  ...jest.requireActual("@src/background/services/crypto"),
  getInstance: jest.fn(() => ({
    encrypt: jest.fn((value: string) => value),
    decrypt: jest.fn((value: string) => value),
    generateEncryptedHmac: jest.fn((value: string) => value),
    getAuthenticCiphertext: jest.fn((value: string) => value),
  })),
}));

jest.mock("@src/background/services/storage");

interface MockStorage {
  get: jest.Mock;
  set: jest.Mock;
  clear: jest.Mock;
}

describe("background/services/credentials", () => {
  const exampleCredential: VerifiableCredential = {
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
  const exampleCredentialMetadata = generateInitialMetadataForVerifiableCredential(exampleCredential);
  const exampleCredentialHash = exampleCredentialMetadata.hash;
  const exampleCryptkeeperCredential: CryptkeeperVerifiableCredential = {
    verifiableCredential: exampleCredential,
    metadata: exampleCredentialMetadata,
  };
  const exampleCryptkeeperCredentialString = serializeCryptkeeperVerifiableCredential(exampleCryptkeeperCredential);

  const exampleCredentialTwo: VerifiableCredential = {
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
  const exampleCredentialMetadataTwo = generateInitialMetadataForVerifiableCredential(exampleCredentialTwo);
  const exampleCredentialHashTwo = exampleCredentialMetadataTwo.hash;
  const exampleCryptkeeperCredentialTwo: CryptkeeperVerifiableCredential = {
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

  const verifiableCredentialsService = VerifiableCredentialsService.getInstance();

  beforeEach(() => {
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
  });

  describe("add and retrieve verifiable credentials", () => {
    test("should successfully add a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(undefined);
      credentialsStorage.set.mockReturnValue(undefined);

      const successfullyInsertedCredential = await verifiableCredentialsService.addVerifiableCredential(
        exampleCredentialString,
      );

      expect(successfullyInsertedCredential).toBe(true);
    });

    test("should add and retrieve a verifiable credential", async () => {
      await verifiableCredentialsService.addVerifiableCredential(exampleCredentialString);
      await verifiableCredentialsService.addVerifiableCredential(exampleCredentialStringTwo);
      const verifiableCredentials = await verifiableCredentialsService.getAllVerifiableCredentials();

      expect(verifiableCredentials.length).toBe(2);
      expect(verifiableCredentials[0].verifiableCredential).toEqual(exampleCredential);
      expect(verifiableCredentials[1].verifiableCredential).toEqual(exampleCredentialTwo);
    });

    test("should not add a verifiable credential with an existing id", async () => {
      const successfullyInsertedCredential = await verifiableCredentialsService.addVerifiableCredential(
        exampleCredentialString,
      );

      expect(successfullyInsertedCredential).toBe(false);
    });

    test("should not add a verifiable credential with an invalid format", async () => {
      const successfullyInsertedCredential = await verifiableCredentialsService.addVerifiableCredential(
        "invalid credential",
      );

      expect(successfullyInsertedCredential).toBe(false);
    });
  });

  describe("delete verifiable credentials", () => {
    test("should delete a verifiable credential", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      const credentialDeleted = await verifiableCredentialsService.deleteVerifiableCredential(exampleCredentialHash);

      expect(credentialDeleted).toBe(true);
      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(JSON.stringify([[...credentialsMap.entries()][1]]));
    });

    test("should not delete a verifiable credential if it does not exist", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      const credentialDeleted = await verifiableCredentialsService.deleteVerifiableCredential("example hash");

      expect(credentialDeleted).toBe(false);
      expect(credentialsStorage.set).toBeCalledTimes(0);
    });

    test("should delete all verifiable credentials", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(credentialsStorageString);
      credentialsStorage.set.mockReturnValue(undefined);

      const allCredentialsDeleted = await verifiableCredentialsService.deleteAllVerifiableCredentials();

      expect(allCredentialsDeleted).toBe(true);
      expect(credentialsStorage.clear).toBeCalledTimes(1);
    });

    test("should return false when deleting all verifiable credentials from empty storage", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      credentialsStorage.get.mockReturnValue(undefined);
      credentialsStorage.set.mockReturnValue(undefined);

      const allCredentialsDeleted = await verifiableCredentialsService.deleteAllVerifiableCredentials();

      expect(allCredentialsDeleted).toBe(false);
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
  });
});
