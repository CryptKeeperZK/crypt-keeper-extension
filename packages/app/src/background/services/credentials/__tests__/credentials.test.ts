import VerifiableCredentialsService from "@src/background/services/credentials";
import SimpleStorage from "@src/background/services/storage";
import { VerifiableCredential } from "@src/types";

const mockAuthenticityCheckData = {
  isNewOnboarding: false,
};

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    encrypt: jest.fn((value: string) => value),
    decrypt: jest.fn((value: string) => value),
    isAuthentic: jest.fn(() => mockAuthenticityCheckData),
  })),
}));

jest.mock("@src/background/services/crypto", (): unknown => ({
  cryptoGenerateEncryptedHmac: jest.fn(() => "encrypted credentials"),
  cryptoGetAuthenticBackupCiphertext: jest.fn(() => "encrypted credentials"),
}));

jest.mock("@src/background/services/storage");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

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
  const exampleCredentialString = JSON.stringify(exampleCredential);
  const exampleCredential2: VerifiableCredential = {
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
  const exampleCredentialString2 = JSON.stringify(exampleCredential2);
  const credentialsMap = new Map<string, string>();
  credentialsMap.set("did:example:123", exampleCredentialString);
  credentialsMap.set("did:example:1234", exampleCredentialString2);
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
      await verifiableCredentialsService.addVerifiableCredential(exampleCredentialString2);
      const verifiableCredentials = await verifiableCredentialsService.getAllVerifiableCredentials();

      expect(verifiableCredentials.length).toBe(2);
      expect(verifiableCredentials[0]).toEqual(exampleCredential);
      expect(verifiableCredentials[1]).toEqual(exampleCredential2);
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

  describe("backup", () => {
    const exampleEncryptedCredentials = "encrypted credentials";
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

      await verifiableCredentialsService.uploadEncryptedStorage(exampleEncryptedCredentials, examplePassword);

      expect(credentialsStorage.set).toBeCalledTimes(1);
      expect(credentialsStorage.set).toBeCalledWith(exampleEncryptedCredentials);
    });

    test("should not upload encrypted identities if there is no data", async () => {
      const [credentialsStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      await verifiableCredentialsService.uploadEncryptedStorage("", "");

      expect(credentialsStorage.set).toBeCalledTimes(0);
    });
  });
});
