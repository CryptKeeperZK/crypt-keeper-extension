/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/unbound-method */
import browser from "webextension-polyfill";

import { Paths } from "@src/constants";

import {
  getLastActiveTabUrl,
  redirectToNewTab,
  getExtensionUrl,
  downloadFile,
  copyToClipboard,
  getUrlOrigin,
  replaceUrlParams,
  isExtensionPopupOpen,
} from "../browser";

jest.unmock("../browser");

describe("util/browser", () => {
  const defaultTabs = [{ url: "http://localhost:3000" }];
  const oldClipboard = navigator.clipboard;

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn() },
    });
  });

  beforeEach(() => {
    (browser.tabs.query as jest.Mock).mockResolvedValue(defaultTabs);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object.assign(navigator, {
      clipboard: oldClipboard,
    });
  });

  test("should get last active tab url properly", async () => {
    const url = await getLastActiveTabUrl();

    expect(url?.origin).toBe(defaultTabs[0].url);
  });

  test("should return undefined if there is no tab url", async () => {
    (browser.tabs.query as jest.Mock).mockResolvedValue([]);

    const url = await getLastActiveTabUrl();

    expect(url).toBeUndefined();
  });

  test("should redirect to new tab properly", async () => {
    await redirectToNewTab("url");

    expect(browser.tabs.create).toBeCalledTimes(1);
    expect(browser.tabs.create).toBeCalledWith({ url: "url" });
  });

  test("should redirect to new tab properly", () => {
    getExtensionUrl("url");

    expect(browser.runtime.getURL).toBeCalledTimes(1);
    expect(browser.runtime.getURL).toBeCalledWith("url");
  });

  test("should download file properly", async () => {
    const element = document.createElement("a");
    element.click = jest.fn();

    const spyCreateElement = jest.spyOn(document, "createElement").mockReturnValue(element);

    await downloadFile("content", "filename");

    expect(spyCreateElement).toBeCalledTimes(1);
    expect(element.click).toBeCalledTimes(1);
  });

  test("should copy to clipboard properly", async () => {
    const spyCopy = jest.spyOn(navigator.clipboard, "writeText");

    await copyToClipboard("content");

    expect(spyCopy).toBeCalledTimes(1);
    expect(spyCopy).toBeCalledWith("content");
  });

  test("should get url origin properly", () => {
    expect(getUrlOrigin()).toBe("");
    expect(getUrlOrigin("http://localhost:1234/#/page1?search=0")).toBe("http://localhost:1234");
  });

  test("should replace url params properly", () => {
    const result = replaceUrlParams(Paths.IDENTITY, { id: "1234", unknown: "4321" });

    expect(result).toBe("/identity/1234");
  });

  test("should check is extension is running in popup mode", () => {
    const result = isExtensionPopupOpen();

    expect(result).toBe(false);
    expect(browser.extension.getViews).toBeCalledTimes(1);
  });
});
