/* eslint-disable @typescript-eslint/unbound-method */
import { browser } from "webextension-polyfill-ts";

import { SimpleStorageService } from "@src/background/services/Storage";

describe("background/services/simpleStorage", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should set data properly", async () => {
    const storage = new SimpleStorageService("key");

    await storage.set("value");

    expect(browser.storage.sync.set).toBeCalledTimes(1);
    expect(browser.storage.sync.set).toBeCalledWith({
      key: "value",
    });
  });

  test("should clear data properly", async () => {
    const storage = new SimpleStorageService("key");

    await storage.clear();

    expect(browser.storage.sync.remove).toBeCalledTimes(1);
    expect(browser.storage.sync.remove).toBeCalledWith("key");
  });

  test("should get data properly", async () => {
    const storage = new SimpleStorageService("key");

    const value = await storage.get();

    expect(browser.storage.sync.get).toBeCalledTimes(1);
    expect(browser.storage.sync.get).toBeCalledWith("key");
    expect(value).toBeNull();
  });
});
