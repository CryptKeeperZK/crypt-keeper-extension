/* eslint-disable @typescript-eslint/unbound-method */
import browser from "webextension-polyfill";

import { checkForLastError, checkForLastErrorAndLog, sendReadyMessageToTabs } from "../browser";

describe("background/shared/browser", () => {
  const defaultTabs = [{ id: 1 }, {}];
  const logSpy = jest.spyOn(console, "error").mockImplementation(() => null);

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);
  });

  afterEach(() => {
    browser.runtime.lastError = undefined;
    jest.clearAllMocks();
  });

  test("should check for last error and log properly", () => {
    browser.runtime.lastError = new Error("error");

    const error = checkForLastErrorAndLog();

    expect(error).toStrictEqual(browser.runtime.lastError);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(error);
  });

  test("should not check for last error if there is no error", () => {
    browser.runtime.lastError = undefined;

    const error = checkForLastErrorAndLog();

    expect(error).toBeUndefined();
    expect(logSpy).toHaveBeenCalledTimes(0);
  });

  test("should check for last error properly", () => {
    browser.runtime.lastError = { message: "error" };

    const error = checkForLastError();

    expect(error).toStrictEqual(new Error(browser.runtime.lastError.message));
  });

  test("should send messages to all the tabs", async () => {
    await sendReadyMessageToTabs();

    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(1);
  });

  test("should handle error while sending messages to all the tabs", async () => {
    const error = new Error("error");
    browser.runtime.lastError = error;
    (browser.tabs.query as jest.Mock).mockRejectedValue(error);

    await sendReadyMessageToTabs();

    expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(0);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(error);
  });
});
