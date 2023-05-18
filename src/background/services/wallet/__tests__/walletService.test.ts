import SimpleStorage from "@src/background/services/storage";

import WalletService from "..";

const mockSerializedKeys = JSON.stringify({
  publicKey: "0x031bd64c030e0a6233ef38aed1df3922219e547a240c7dc8635749163ec1a0abe7",
  privateKey: "0x046f3d3acae9e8babbfcbd5ecc962843e6eff65093d1bd086c6a738e87e51e41",
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

describe("background/services/wallet", () => {
  const walletService = WalletService.getInstance();
  const defaultMnemonic = "test test test test test test test test test test test junk";
  const defaultSignedMessage =
    "0x8b7a1e6c0638291c674af226dd97f5354bb3723d611128ad35fda772b9051eab5fec16aacf700ba186590b170a16bfff576078695ac26a3321f9636c6a4a6c051b";

  beforeEach(() => {
    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockReturnValue(mockSerializedKeys);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
    });
  });

  afterEach(async () => {
    await walletService.clear();

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockClear();
      instance.set.mockClear();
      instance.clear.mockClear();
    });
  });

  describe("keys", () => {
    test("should generate key pair properly", async () => {
      await walletService.generateKeyPair(defaultMnemonic);

      const [keyStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      expect(keyStorage.set).toBeCalledTimes(1);
    });

    test("should sign message properly", async () => {
      await walletService.generateKeyPair(defaultMnemonic);

      const result = await walletService.signMessage("message");

      expect(result).toBe(defaultSignedMessage);
    });

    test("should sign message with nonce properly", async () => {
      await walletService.generateKeyPair(defaultMnemonic);

      const result = await walletService.signMessage("message nonce: 1");

      expect(result).not.toBe(defaultSignedMessage);
    });

    test("should not sign message if there is no key pair", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await expect(walletService.signMessage("message")).rejects.toThrowError("No key pair available");
    });
  });

  describe("backup", () => {
    test("should download encrypted keys", async () => {
      const result = await walletService.downloadEncryptedStorage("password");

      expect(result).toBeDefined();
    });

    test("should not download encrypted keys if storage is empty", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const result = await walletService.downloadEncryptedStorage("password");

      expect(result).toBeNull();
    });

    test("should upload encrypted keys", async () => {
      await walletService.uploadEncryptedStorage("encrypted", "password");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(1);
        expect(instance.set).toBeCalledWith("encrypted");
      });
    });

    test("should not upload encrypted keys if there is no data", async () => {
      await walletService.uploadEncryptedStorage("", "");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(0);
      });
    });
  });
});
