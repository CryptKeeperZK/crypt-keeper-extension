/**
 * @jest-environment jsdom
 */

import { RPCAction } from "@cryptkeeperzk/providers";

import { store } from "@src/ui/store/configureAppStore";
import postMessage from "@src/util/postMessage";

import { downloadBackup } from "../backup";

jest.mock("@src/util/postMessage");

describe("ui/ducks/backup", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should download backup properly", async () => {
    (postMessage as jest.Mock).mockResolvedValue("content");

    const result = await Promise.resolve(store.dispatch(downloadBackup("password")));

    expect(postMessage).toBeCalledTimes(1);
    expect(postMessage).toBeCalledWith({ method: RPCAction.DOWNLOAD_BACKUP, payload: "password" });
    expect(result).toBe("content");
  });
});
