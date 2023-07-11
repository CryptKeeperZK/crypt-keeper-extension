/**
 * @jest-environment jsdom
 */
import chrome from "jest-chrome";

import {
  BROWSER_PLATFORM_BRAVE,
  BROWSER_PLATFORM_CHROME,
  BROWSER_PLATFORM_EDGE,
  BROWSER_PLATFORM_FIREFOX,
  BROWSER_PLATFORM_OPERA,
} from "@src/constants";

import { createChromeOffscreen, deferredPromise, getBrowserPlatform } from "../utils";

Object.assign(global, chrome);

// Mock the chrome module
jest.mock("jest-chrome", () => ({
  chrome: {
    offscreen: {
      hasDocument: jest.fn(),
      createDocument: jest.fn(),
      Reason: jest.fn(() => ({
        DOM_SCRAPING: "DOM_SCRAPING",
      })),
    },
  },
}));

describe("background/shared/utils", () => {
  test("should create deferred promise and resolve properly", () => {
    const { promise, resolve, reject } = deferredPromise();

    resolve?.(true);

    expect(promise).resolves.toBe(true);
    expect(typeof resolve === "function").toBe(true);
    expect(typeof reject === "function").toBe(true);
  });

  test("should create deferred promise and reject properly", () => {
    const { promise, resolve, reject } = deferredPromise();

    reject?.(false);

    expect(promise).rejects.toBe(false);
    expect(typeof resolve === "function").toBe(true);
    expect(typeof reject === "function").toBe(true);
  });

  test("should check the Chrome browser platform", () => {
    const browserPlatform = getBrowserPlatform();
    expect(browserPlatform).toBe(BROWSER_PLATFORM_CHROME);
  });

  test("should check the Firefox browser platform", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; rv:78.0) Gecko/20100101 Firefox/78.0",
      configurable: true,
    });

    const browserPlatform = getBrowserPlatform();
    expect(browserPlatform).toBe(BROWSER_PLATFORM_FIREFOX);
  });

  test("should check the Edge browser platform", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79",
      configurable: true,
    });

    const browserPlatform = getBrowserPlatform();
    expect(browserPlatform).toBe(BROWSER_PLATFORM_EDGE);
  });

  test("should check the Opera browser platform", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 OPR/100.0.0.0",
      configurable: true,
    });

    const browserPlatform = getBrowserPlatform();
    expect(browserPlatform).toBe(BROWSER_PLATFORM_OPERA);
  });

  test("should check the Brave browser platform", () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "",
      configurable: true,
    });
    Object.defineProperty(window.navigator, "brave", {});

    const browserPlatform = getBrowserPlatform();
    expect(browserPlatform).toBe(BROWSER_PLATFORM_BRAVE);
  });

  test("should be able to create a chrome offscreen", async () => {
    await createChromeOffscreen();
    expect(global.chrome.offscreen.hasDocument).toBeCalled();
    expect(global.chrome.offscreen.hasDocument).toBeCalledTimes(2);
    expect(global.chrome.offscreen.createDocument).toBeCalledTimes(2);
    expect(global.chrome.offscreen.createDocument).toHaveBeenCalledWith({
      url: "offscreen.html",
      reasons: [global.chrome.offscreen.Reason.DOM_SCRAPING],
      justification: "Cryptkeeper Offscrreen for generating ZKP",
    });
  });
});
