import { browser } from "webextension-polyfill-ts";

import { RPCAction } from "@src/constants";
import pushMessage from "../pushMessage";

jest.mock("webextension-polyfill-ts", (): unknown => ({
  browser: {
    runtime: {
      sendMessage: jest.fn(),
    },
  },
}));

describe("util/pushMessage", () => {
  beforeEach(() => {
    (browser.runtime.sendMessage as jest.Mock).mockResolvedValue([null, {}]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should post message properly", async () => {
    const result = pushMessage({
      type: RPCAction.DUMMY_REQUEST,
      payload: {},
      error: false,
      meta: {},
    });

    await expect(result).resolves.not.toThrow();
  });

  test("should throw error if there is an error in response", async () => {
    (browser.runtime.sendMessage as jest.Mock).mockRejectedValue(new Error("error"));

    const result = pushMessage({
      type: RPCAction.DUMMY_REQUEST,
      payload: {},
      error: true,
      meta: {},
    });

    await expect(result).resolves.not.toThrow();
  });
});
