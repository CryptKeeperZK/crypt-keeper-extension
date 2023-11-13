/**
 * @jest-environment jsdom
 */
import { RPCInternalAction } from "@src/constants";
import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import { createOnboardingBackupRequest, createUploadBackupRequest, downloadBackup, uploadBackup } from "../backup";

jest.mock("@src/util/postMessage");

describe("ui/ducks/backup", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should download backup properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue("content");

    const result = await Promise.resolve(store.dispatch(downloadBackup("password")));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({ method: RPCInternalAction.DOWNLOAD_BACKUP, payload: "password" });
    expect(result).toBe("content");
  });

  test("should create upload backup request properly", async () => {
    await Promise.resolve(store.dispatch(createUploadBackupRequest()));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.REQUEST_UPLOAD_BACKUP,
    });
  });

  test("should create onboarding backup request properly", async () => {
    await Promise.resolve(store.dispatch(createOnboardingBackupRequest()));

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.REQUEST_ONBOARDING_BACKUP,
    });
  });

  test("should upload backup properly", async () => {
    await Promise.resolve(
      store.dispatch(uploadBackup({ password: "password", backupPassword: "password", content: "content" })),
    );

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({
      method: RPCInternalAction.UPLOAD_BACKUP,
      payload: { password: "password", backupPassword: "password", content: "content" },
    });
  });
});
