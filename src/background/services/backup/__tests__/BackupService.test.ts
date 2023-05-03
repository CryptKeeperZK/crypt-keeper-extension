import BackupService, { type IBackupable } from "..";

describe("background/services/backup/BackupService", () => {
  const backupService = BackupService.getInstance();

  const defaultBackupable: IBackupable = {
    downloadEncryptedStorage: jest.fn(() => Promise.resolve("encrypted")),
    uploadEncryptedStorage: jest.fn(),
  };

  const nullBackupable: IBackupable = {
    downloadEncryptedStorage: jest.fn(() => Promise.resolve(null)),
    uploadEncryptedStorage: jest.fn(),
  };

  afterEach(() => {
    backupService.clear();
  });

  test("should add backupable services properly", () => {
    const backupables = backupService.add("key1", defaultBackupable).getBackupables();

    expect(backupables.size).toBe(1);
    expect(backupables.get("key1")).toStrictEqual(defaultBackupable);
  });

  test("should remove backupable services properly", () => {
    const backupables = backupService.add("key1", defaultBackupable).remove("key1").getBackupables();

    expect(backupables.size).toBe(0);
  });

  test("should clear backupable services properly", () => {
    const backupables = backupService.add("key1", defaultBackupable).clear().getBackupables();

    expect(backupables.size).toBe(0);
  });

  test("should download backup data properly", async () => {
    const expectedData = JSON.stringify({ key1: "encrypted", key2: null }, null, 4);
    const backupFileContent = await backupService
      .add("key1", defaultBackupable)
      .add("key2", nullBackupable)
      .download("password");

    expect(backupFileContent).toBe(`data:application/json;charset=utf-8,${encodeURIComponent(expectedData)}`);
  });

  test("should upload backup data properly", async () => {
    const fileContent = JSON.stringify({ key1: "encrypted", key2: null }, null, 4);
    const result = await backupService
      .add("key1", defaultBackupable)
      .add("key2", nullBackupable)
      .upload({ content: fileContent, password: "password" });

    expect(result).toBe(true);
  });

  test("should download and upload the same backup data properly", async () => {
    const expectedData = JSON.stringify({ key1: "encrypted", key2: null }, null, 4);

    const backupFileContent = await backupService
      .add("key1", defaultBackupable)
      .add("key2", nullBackupable)
      .download("password");
    const result = await backupService
      .add("key1", defaultBackupable)
      .add("key2", nullBackupable)
      .upload({ content: expectedData, password: "password" });

    expect(backupFileContent).toBe(`data:application/json;charset=utf-8,${encodeURIComponent(expectedData)}`);
    expect(result).toBe(true);
  });

  test("should throw errors when uploading invalid data", async () => {
    const fileContent = JSON.stringify({ unknown: "encrypted" }, null, 4);
    backupService.add("key1", defaultBackupable).add("key2", nullBackupable);

    await expect(backupService.upload({ content: fileContent, password: "password" })).rejects.toThrowError(
      "File content is corrupted",
    );
    await expect(backupService.upload({ content: "", password: "password" })).rejects.toThrowError();
  });
});
