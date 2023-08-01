import { BackupableServices, InitializationStep } from "@src/types";

import BackupService, { type IBackupable } from "..";

jest.mock("@src/background/services/history", (): unknown => ({
  getInstance: jest.fn(() => ({
    loadSettings: jest.fn(),
    trackOperation: jest.fn(),
  })),
}));

jest.mock("@src/background/services/notification", (): unknown => ({
  getInstance: jest.fn(() => ({
    create: jest.fn(),
  })),
}));

jest.mock("@src/background/services/crypto", (): unknown => ({
  getInstance: jest.fn(() => ({
    isAuthenticPassword: jest.fn(),
  })),
}));

jest.mock("@src/background/controllers/browserUtils", (): unknown => ({
  getInstance: jest.fn(() => ({
    openPopup: jest.fn(),
  })),
}));

const mockGetInitialization = jest.fn(() => Promise.resolve(InitializationStep.MNEMONIC));

jest.mock("@src/background/services/misc", (): unknown => ({
  ...jest.requireActual("@src/background/services/misc"),
  getInstance: jest.fn(() => ({
    getInitialization: mockGetInitialization,
    setInitialization: jest.fn(),
  })),
}));

describe("background/services/backup/BackupService", () => {
  const backupService = BackupService.getInstance();

  const defaultBackupable: IBackupable = {
    downloadEncryptedStorage: jest.fn(() => Promise.resolve("encrypted")),
    uploadEncryptedStorage: jest.fn(),
    downloadStorage: jest.fn(),
    restoreStorage: jest.fn(),
  };

  const nullBackupable: IBackupable = {
    downloadEncryptedStorage: jest.fn(() => Promise.resolve(null)),
    uploadEncryptedStorage: jest.fn(),
    downloadStorage: jest.fn(),
    restoreStorage: jest.fn(),
  };

  const defaultPasswords = {
    password: "password",
    backupPassword: "password",
  };

  beforeEach(() => {
    mockGetInitialization.mockResolvedValue(InitializationStep.MNEMONIC);
  });

  afterEach(() => {
    backupService.clear();
    jest.clearAllMocks();
  });

  test("should create upload backup request properly", async () => {
    await expect(backupService.createUploadBackupRequest()).resolves.toBeUndefined();
  });

  test("should create onboarding backup request properly", async () => {
    await expect(backupService.createOnboardingBackupRequest()).resolves.toBeUndefined();
  });

  test("should add backupable services properly", () => {
    const backupables = backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .getBackupables();

    expect(backupables.size).toBe(2);
    expect(backupables.get(BackupableServices.LOCK)).toStrictEqual(defaultBackupable);
    expect(backupables.get(BackupableServices.WALLET)).toStrictEqual(defaultBackupable);
  });

  test("should remove backupable services properly", () => {
    const backupables = backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .remove(BackupableServices.LOCK)
      .remove(BackupableServices.WALLET)
      .getBackupables();

    expect(backupables.size).toBe(0);
  });

  test("should clear backupable services properly", () => {
    const backupables = backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .clear()
      .getBackupables();

    expect(backupables.size).toBe(0);
  });

  test("should download backup data properly", async () => {
    const expectedData = JSON.stringify({ lock: "encrypted", wallet: "encrypted", approval: null }, null, 4);
    const backupFileContent = await backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .add(BackupableServices.APPROVAL, nullBackupable)
      .download("password");

    expect(backupFileContent).toBe(`data:application/json;charset=utf-8,${encodeURIComponent(expectedData)}`);
  });

  test("should upload backup data properly", async () => {
    const fileContent = JSON.stringify({ lock: "encrypted", wallet: "encrypted", approval: null }, null, 4);
    const result = await backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .add(BackupableServices.APPROVAL, nullBackupable)
      .upload({ content: fileContent, ...defaultPasswords });

    expect(result).toBe(true);
  });

  test("should download and upload the same backup data properly", async () => {
    const expectedData = JSON.stringify({ lock: "encrypted", wallet: "encrypted" }, null, 4);

    const backupFileContent = await backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .download("password");
    const result = await backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .upload({ content: expectedData, ...defaultPasswords });

    expect(backupFileContent).toBe(`data:application/json;charset=utf-8,${encodeURIComponent(expectedData)}`);
    expect(result).toBe(true);
  });

  test("should throw errors when uploading invalid data", async () => {
    const invalidFileContent = JSON.stringify({ unknown: "encrypted" }, null, 4);
    const fileContent = JSON.stringify({ lock: "encrypted", wallet: "encrypted", approval: "encrypted" }, null, 4);

    await expect(backupService.upload({ content: invalidFileContent, ...defaultPasswords })).rejects.toThrowError(
      "File content is corrupted",
    );

    backupService.getBackupables().forEach((service) => {
      expect(service.downloadStorage).toBeCalledTimes(0);
      expect(service.restoreStorage).toBeCalledTimes(0);
    });

    backupService
      .add(BackupableServices.LOCK, defaultBackupable)
      .add(BackupableServices.WALLET, defaultBackupable)
      .add(BackupableServices.APPROVAL, {
        downloadEncryptedStorage: jest.fn(),
        uploadEncryptedStorage: jest.fn(() => Promise.reject(new Error("error"))),
        downloadStorage: jest.fn(),
        restoreStorage: jest.fn(),
      });

    await expect(backupService.upload({ content: fileContent, ...defaultPasswords })).rejects.toThrow("error");
  });

  test("should rollback to previous storage data properly", async () => {
    mockGetInitialization.mockResolvedValue(InitializationStep.NEW);

    const fileContent = JSON.stringify({ lock: "encrypted", wallet: "encrypted", approval: "encrypted" }, null, 4);

    backupService
      .add(BackupableServices.LOCK, { ...defaultBackupable, downloadStorage: jest.fn() })
      .add(BackupableServices.WALLET, { ...defaultBackupable, restoreStorage: jest.fn() })
      .add(BackupableServices.APPROVAL, {
        downloadEncryptedStorage: jest.fn(),
        uploadEncryptedStorage: jest.fn(() => Promise.reject(new Error("error"))),
        downloadStorage: jest.fn(),
        restoreStorage: jest.fn(),
      });

    await expect(backupService.upload({ content: fileContent, ...defaultPasswords })).rejects.toThrow("error");

    backupService.getBackupables().forEach((service) => {
      expect(service.downloadStorage).toBeCalledTimes(1);
      expect(service.restoreStorage).toBeCalledTimes(1);
    });
  });
});
