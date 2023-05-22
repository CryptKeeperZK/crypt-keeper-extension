import { HDNodeWallet, Wallet } from "ethers";

import { generateMnemonic } from "@src/background/services/mnemonic";
import SimpleStorage from "@src/background/services/storage";
import { ZERO_ADDRESS } from "@src/config/const";

import WalletService from "..";

const mockAccounts = [
  {
    publicKey: "0x031bd64c030e0a6233ef38aed1df3922219e547a240c7dc8635749163ec1a0abe7",
    privateKey: "0x046f3d3acae9e8babbfcbd5ecc962843e6eff65093d1bd086c6a738e87e51e41",
    address: ZERO_ADDRESS,
  },
];

const mockSerializedAccounts = JSON.stringify(mockAccounts);

const mockAuthenticityCheckData = {
  isNewOnboarding: true,
};

const mockSignedMessage =
  "0x8b7a1e6c0638291c674af226dd97f5354bb3723d611128ad35fda772b9051eab5fec16aacf700ba186590b170a16bfff576078695ac26a3321f9636c6a4a6c051b";

jest.mock("ethers", (): unknown => ({
  ...jest.requireActual("ethers"),
  Wallet: jest.fn(() => ({
    signMessage: jest.fn(() => Promise.resolve(mockSignedMessage)),
  })),
}));

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

jest.mock("@src/background/services/mnemonic", (): unknown => ({
  generateMnemonic: jest.fn(),
}));

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/wallet", () => {
  const walletService = WalletService.getInstance();
  const defaultMnemonic = "test test test test test test test test test test test junk";

  beforeEach(() => {
    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockReturnValue(mockSerializedAccounts);
      instance.set.mockReturnValue(undefined);
      instance.clear.mockReturnValue(undefined);
    });

    Wallet.fromPhrase = jest.fn(() => mockAccounts[0] as unknown as HDNodeWallet);

    (generateMnemonic as jest.Mock).mockReturnValue(defaultMnemonic);
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
      const [keyStorage, mnemonicStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];
      keyStorage.get.mockReturnValue(undefined);
      mnemonicStorage.get.mockReturnValue(defaultMnemonic);

      await walletService.generateKeyPair();

      expect(keyStorage.set).toBeCalledTimes(1);
    });

    test("should generate key pair properly", async () => {
      await walletService.generateKeyPair();

      const [keyStorage, mnemonicStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage, MockStorage];

      expect(keyStorage.set).toBeCalledTimes(1);
      expect(mnemonicStorage.get).toBeCalledTimes(1);
      expect(mnemonicStorage.clear).toBeCalledTimes(1);
    });

    test("should not generate key pair if there is no mnemonic", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await expect(walletService.generateKeyPair()).rejects.toThrowError("Generate mnemonic first");
    });

    test("should sign message properly", async () => {
      await walletService.generateKeyPair();

      const result = await walletService.signMessage({ message: "message", address: ZERO_ADDRESS });

      expect(result).toBe(mockSignedMessage);
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

      expect(result).toBe(mockSignedMessage);
    });
  });

  describe("mnemonic", () => {
    test("should generate mnemonic properly", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      const mnemonic = await walletService.generateMnemonic();

      expect(mnemonic).toBe(defaultMnemonic);
    });

    test("should throw an error if key pair is already created", async () => {
      await expect(walletService.generateMnemonic()).rejects.toThrowError("Key pair is already generated");
    });

    test("should return already generated mnemonic properly", async () => {
      const [accountStorage, mnemonicStorage] = (SimpleStorage as jest.Mock).mock.instances as [
        MockStorage,
        MockStorage,
      ];
      accountStorage.get.mockReturnValue(undefined);
      mnemonicStorage.get.mockReturnValue(defaultMnemonic);

      const mnemonic = await walletService.generateMnemonic();

      expect(mnemonic).toBeDefined();
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

      const [accountStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      expect(accountStorage.set).toBeCalledTimes(1);
      expect(accountStorage.set).toBeCalledWith(mockSerializedAccounts);
    });

    test("should upload encrypted data with empty storage", async () => {
      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        instance.get.mockReturnValue(undefined);
      });

      await walletService.uploadEncryptedStorage(mockSerializedAccounts, "password");

      const [accountStorage] = (SimpleStorage as jest.Mock).mock.instances as [MockStorage];
      expect(accountStorage.set).toBeCalledTimes(1);
      expect(accountStorage.set).toBeCalledWith(mockSerializedAccounts);
    });

    test("should not upload encrypted keys if there is no data", async () => {
      await walletService.uploadEncryptedStorage("", "");

      (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
        expect(instance.set).toBeCalledTimes(0);
      });
    });
  });
});
