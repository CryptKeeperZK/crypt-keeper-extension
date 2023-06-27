import { RPCAction } from "@cryptkeeper/providers";
import browser from "webextension-polyfill";

import postMessage from "../postMessage";

jest.unmock("@src/util/postMessage");

describe("util/postMessage", () => {
  beforeEach(() => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValue([null, {}]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should post message properly", async () => {
    const result = await postMessage({
      method: RPCAction.DUMMY_REQUEST,
      payload: {},
      error: false,
      meta: {},
    });

    expect(result).toBeDefined();
  });

  test("should throw error if there is an error in response", async () => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValue([new Error("error"), null]);

    const result = postMessage({
      method: RPCAction.DUMMY_REQUEST,
      payload: {},
      error: true,
      meta: {},
    });

    await expect(result).rejects.toThrowError("Error: error");
  });
});
