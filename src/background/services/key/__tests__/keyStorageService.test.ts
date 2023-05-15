import SimpleStorage from "@src/background/services/storage";

import KeyStorageService from "..";

const mockSerializedKeys = JSON.stringify({
  publicKey: "O2onvM62pC1io6jQKm8Nc2UyFXcd4kOmOsBIoYtZ2ik=",
  secretKey: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7aie8zrakLWKjqNAqbw1zZTIVdx3iQ6Y6wEihi1naKQ==",
});

const mockAuthenticityCheckData = {
  isNewOnboarding: true,
};

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    encrypt: jest.fn(() => mockSerializedKeys),
    decrypt: jest.fn(() => mockSerializedKeys),
    isAuthentic: jest.fn(() => mockAuthenticityCheckData),
  })),
}));

jest.mock("@src/background/services/misc", (): unknown => ({
  ...jest.requireActual("@src/background/services/misc"),
  getInstance: jest.fn(() => ({
    setInitialization: jest.fn(),
  })),
}));

jest.mock("@src/background/services/crypto", (): unknown => ({
  cryptoGenerateEncryptedHmac: jest.fn(() => "encrypted"),
  cryptoGetAuthenticBackupCiphertext: jest.fn(() => "encrypted"),
}));

jest.mock("@src/background/services/storage");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/key", () => {
  const keyStorageService = KeyStorageService.getInstance();
  const defaultMnemonic = "test test test test test test test test test test test junk";
  const defaultSignedMessage =
    "0x24fbab0609c71311cd0f5c28a30f6707bc554232a47471acd739d06e0bf4b6d6703b3d7a3a53820c37ef5df284f1ed3151fb36bbbc229dabfc203c28eddd44056d657373616765";

  beforeEach(() => {
    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockReturnValue(mockSerializedKeys);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
    });
  });

  afterEach(async () => {
    await keyStorageService.clear();

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockClear();
      instance.set.mockClear();
      instance.clear.mockClear();
    });
  });

  describe("keys", () => {
    test("should generate key pair properly", async () => {
      await keyStorageService.generateKeyPair(defaultMnemonic);

      const [keyStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      expect(keyStorage.set).toBeCalledTimes(1);
    });

    test("should sign message properly", async () => {
      await keyStorageService.generateKeyPair(defaultMnemonic);

      const result = await keyStorageService.signMessage("message");

      expect(result).toBe(defaultSignedMessage);
    });

    test("should sign message with nonce properly", async () => {
      await keyStorageService.generateKeyPair(defaultMnemonic);

      const result = await keyStorageService.signMessage("message nonce: 1");

      expect(result).not.toBe(defaultSignedMessage);
    });

    test("should not sign message if there is no key pair", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await expect(keyStorageService.signMessage("message")).rejects.toThrowError("No key pair available");
    });
  });

  describe("backup", () => {
    test("should download encrypted keys", async () => {
      const result = await keyStorageService.downloadEncryptedStorage("password");

      expect(result).toBeDefined();
    });

    test("should not download encrypted keys if storage is empty", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await keyStorageService.downloadEncryptedStorage("password");

      expect(result).toBeNull();
    });

    test("should upload encrypted keys", async () => {
      await keyStorageService.uploadEncryptedStorage("encrypted", "password");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(1);
        expect(instance.set).toBeCalledWith("encrypted");
      });
    });

    test("should not upload encrypted keys if there is no data", async () => {
      await keyStorageService.uploadEncryptedStorage("", "");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(0);
      });
    });
  });
});
