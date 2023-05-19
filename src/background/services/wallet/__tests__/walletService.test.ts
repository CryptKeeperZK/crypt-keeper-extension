import SimpleStorage from "@src/background/services/storage";
import { ZERO_ADDRESS } from "@src/config/const";

import WalletService from "..";

const mockSerializedAccounts = JSON.stringify([
  {
    publicKey: "0x031bd64c030e0a6233ef38aed1df3922219e547a240c7dc8635749163ec1a0abe7",
    privateKey: "0x046f3d3acae9e8babbfcbd5ecc962843e6eff65093d1bd086c6a738e87e51e41",
    address: ZERO_ADDRESS,
  },
]);

const mockAuthenticityCheckData = {
  isNewOnboarding: true,
};

jest.mock("@src/background/services/lock", (): unknown => ({
  getInstance: jest.fn(() => ({
    encrypt: jest.fn(() => mockSerializedAccounts),
    decrypt: jest.fn(() => mockSerializedAccounts),
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
      instance.get.mockReturnValue(mockSerializedAccounts);
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
    test("should generate key pair properly with empty store", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await walletService.generateKeyPair(defaultMnemonic);

      const [keyStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      expect(keyStorage.set).toBeCalledTimes(1);
    });

    test("should generate key pair properly", async () => {
      await walletService.generateKeyPair(defaultMnemonic);

      const [keyStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];

      expect(keyStorage.set).toBeCalledTimes(1);
    });

    test("should sign message properly", async () => {
      await walletService.generateKeyPair(defaultMnemonic);

      const result = await walletService.signMessage({ message: "message", address: ZERO_ADDRESS });

      expect(result).toBe(defaultSignedMessage);
    });

    test("should sign message with nonce properly", async () => {
      await walletService.generateKeyPair(defaultMnemonic);

      const result = await walletService.signMessage({ message: "message nonce: 1", address: ZERO_ADDRESS });

      expect(result).not.toBe(defaultSignedMessage);
    });

    test("should not sign message if there is no key pair", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await expect(walletService.signMessage({ message: "message", address: ZERO_ADDRESS })).rejects.toThrowError(
        "No key pair available",
      );
    });

    test("should sign message with first account if there is no specified address", async () => {
      const result = await walletService.signMessage({ message: "message", address: "unknown" });

      expect(result).toBe(defaultSignedMessage);
    });
  });

  describe("accounts", () => {
    test("should get wallet addresses properly", async () => {
      const accounts = await walletService.accounts();

      expect(accounts).toStrictEqual([ZERO_ADDRESS]);
    });

    test("should return empty array if there is no any account", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const accounts = await walletService.accounts();

      expect(accounts).toHaveLength(0);
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
      await walletService.uploadEncryptedStorage(mockSerializedAccounts, "password");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(1);
        expect(instance.set).toBeCalledWith(mockSerializedAccounts);
      });
    });

    test("should upload encrypted data with empty storage", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await walletService.uploadEncryptedStorage(mockSerializedAccounts, "password");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(1);
        expect(instance.set).toBeCalledWith(mockSerializedAccounts);
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
